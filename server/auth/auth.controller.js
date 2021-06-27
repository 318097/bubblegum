const { OAuth2Client } = require("google-auth-library");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../api/user/user.model");
const { signToken, validateToken } = require("../utils/authentication");
const config = require("../config");
const { extractUserData, generateDate } = require("../helpers");
const { generateDefaultState } = require("../defaults");
const SessionModel = require("../models/session.model");
const sendMail = require("../utils/mail");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_OAUTH.CLIENT_ID,
  config.GOOGLE_OAUTH.CLIENT_SECRET,
  config.GOOGLE_OAUTH.REDIRECT_URL
);

const RegisterSchemaValidator = Joi.object().keys({
  name: Joi.string(),
  username: Joi.string(),
  password: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  mobile: Joi.number(),
});

const login = async (req, res) => {
  const { username, password, authToken, authMethod = "LOGIN" } = req.body;
  const matchQuery = {};

  if (authMethod === "GOOGLE") {
    const client = new OAuth2Client(config.GOOGLE_OAUTH.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: authToken,
      audience: config.GOOGLE_OAUTH.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    matchQuery["email"] = payload.email;
  } else if (authMethod === "AUTH_TOKEN") {
    const decoded = validateToken(authToken);
    matchQuery["_id"] = decoded._id;
  } else {
    if (!username || !password)
      return res.status(400).send("Username & Password is required.");

    matchQuery["username"] = username;
  }

  let user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("User not found.");

  if (authMethod === "LOGIN" && !user.authenticate(password))
    return res.status(401).send("Invalid username/password.");

  const appStatus = _.get(user, ["appStatus", [req.source], "status"]);
  if (!appStatus || appStatus === "INIT") {
    user = await User.findOneAndUpdate(
      matchQuery,
      {
        $set: {
          [`appStatus.${req.source}`]: {
            status: "ACTIVE",
            activatedOn: generateDate(),
          },
        },
      },
      { new: true }
    );
  }

  user = user.toObject();
  const userInfoToSend = await extractUserData({ user, source: req.source });

  const token = signToken(user._id, user.email);

  res.send({ token, ...userInfoToSend });

  await SessionModel.create({
    userId: user._id,
    source: req.source,
    authMethod,
    token,
  });
};

const register = async (req, res) => {
  const data = _.pick(req.body, [
    "name",
    "username",
    "password",
    "email",
    "mobile",
  ]);
  const { error } = Joi.validate(data, RegisterSchemaValidator);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, username } = data;
  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) throw new Error("Email/Username already exists.");

  const defaultState = generateDefaultState(req);

  const result = await User.create({
    ...req.body,
    ...defaultState,
  });

  res.send({ result });
};

const checkAccountStatus = async (req, res) => {
  const result = await extractUserData(req);
  res.send(result);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(404).send("Email is required");

  const matchQuery = { email };

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("Invalid email id");

  const resetToken = uuidv4();

  await sendMail(user, {
    resetToken,
    type: "RESET",
  });

  await User.findOneAndUpdate(matchQuery, {
    $set: {
      resetToken,
    },
  });

  res.send("ok");
};

const resetPassword = async (req, res) => {
  const { password, resetToken } = req.body;

  const matchQuery = { resetToken };

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(404).send("Invalid token");

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const updatedData = {
    password: hashedPassword,
    lastPasswordUpdated: generateDate(),
    resetToken: null,
  };

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: updatedData,
    }
  );

  res.send("ok");
};

const generateGoogleOAuthURL = async (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.send({ url });
};

const generateGoogleOAuthToken = async (req, res) => {
  const { code } = req.body;
  const { tokens } = await oauth2Client.getToken(code);
  res.send(tokens);
};

module.exports = {
  login,
  register,
  checkAccountStatus,
  forgotPassword,
  resetPassword,
  generateGoogleOAuthURL,
  generateGoogleOAuthToken,
};
