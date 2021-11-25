const { OAuth2Client } = require("google-auth-library");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const { v4: uuidv4 } = require("uuid");
const User = require("../api/user/user.model");
const { signToken, validateToken } = require("../utils/authentication");
const config = require("../config");
const { extractUserData, generateDate } = require("../utils/common");
const sendMail = require("../utils/sendgrid");
const { google } = require("googleapis");
const {
  encryptPassword,
  generateDefaultUserState,
  updateAccountStatus,
} = require("../api/user/user.utils");
const { createNewSession } = require("../utils/session");
const { verifyAccountStatus } = require("../utils/account");

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
    // JWT token
    const decoded = validateToken(authToken);
    matchQuery["_id"] = decoded._id;
  } else {
    if (!username || !password)
      return res.status(400).send("USERNAME_AND_PASSWORD_REQUIRED");

    matchQuery["username"] = username;
  }

  let user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("USER_NOT_FOUND");

  if (authMethod === "LOGIN" && !user.authenticate(password))
    return res.status(401).send("INVALID_USERNAME_OR_PASSWORD");

  const appStatus = _.get(user, ["appStatus", req.source, "status"]);

  let userUpdateData = { lastLogin: generateDate() };

  if (!appStatus || appStatus === "INIT") {
    userUpdateData = {
      ...userUpdateData,
      [`appStatus.${req.source}`]: {
        status: "ACTIVE",
        activatedOn: generateDate(),
      },
    };
  }

  user = await User.findOneAndUpdate(
    matchQuery,
    { $set: userUpdateData },
    {
      new: true,
    }
  );

  user = user.toObject();
  const userInfoToSend = await extractUserData({ user, source: req.source });

  const token = signToken(user._id, user.email);

  res.send({ token, ...userInfoToSend });

  await createNewSession({
    userId: user._id,
    source: req.source,
    authMethod,
    token,
  });
};

const register = async (req, res) => {
  const { source } = req;
  const data = _.pick(req.body, [
    "name",
    "username",
    "password",
    "email",
    "mobile",
  ]);
  const { error } = Joi.validate(data, RegisterSchemaValidator);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, username, name } = data;
  const userExists = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (userExists) throw new Error("Email/Username already exists.");

  const token = uuidv4();
  const defaultState = generateDefaultUserState(req, { token });

  const result = await User.create({
    ...data,
    ...defaultState,
  });

  sendMail({
    name,
    email,
    type: "VERIFY_ACCOUNT",
    source,
    token,
  });

  res.send({ result });
};

const checkAccountStatus = async (req, res) => {
  await verifyAccountStatus(req);
  const result = await extractUserData(req);
  res.send(result);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { source } = req;

  if (!email) return res.status(404).send("EMAIL_REQUIRED");

  const matchQuery = { email };

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("INVALID_EMAIL");

  const token = uuidv4();
  user.resetToken = token;
  await user.save();
  const { name } = user;

  await sendMail({
    name,
    email,
    token,
    type: "FORGOT_PASSWORD",
    source,
  });

  res.send("ok");
};

const resetPassword = async (req, res) => {
  const { password, resetToken } = req.body;

  const matchQuery = { resetToken };

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(404).send("INVALID_TOKEN");

  user.password = password;
  user.lastPasswordUpdated = generateDate();
  user.resetToken = null;
  await user.save();

  res.send("ok");
};

const changePassword = async (req, res) => {
  const { existingPassword, newPassword } = req.body;

  const user = await User.findOne({ _id: req.user._id });

  if (user.password !== encryptPassword(existingPassword))
    return res.status(404).send("INCORRECT_PASSWORD");

  user.password = newPassword;
  await user.save();

  res.send("ok");
};

const verifyAccount = async (req, res) => {
  const { verificationToken } = req.body;
  const { source } = req;

  const matchQuery = { "accountStatus.verificationToken": verificationToken };

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(404).send("INVALID_VERIFICATION_TOKEN");

  user.accountStatus = updateAccountStatus(user.accountStatus, {
    source,
    verified: true,
  });

  await user.save();
  const { name, email } = user;
  sendMail({
    name,
    email,
    type: "WELCOME",
    source,
  });

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
  changePassword,
  verifyAccount,
};
