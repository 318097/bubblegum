const User = require("../api/user/model");
const { signToken } = require("./auth");
const Joi = require("@hapi/joi");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const config = require("../../config");
const { ObjectId } = require("mongoose").Types;
const { extractUserData } = require("../helpers");

const client = new OAuth2Client(config.GOOGLE_LOGIN_CLIENT_ID);

const RegisterSchemaValidator = Joi.object().keys({
  name: Joi.string(),
  username: Joi.string(),
  password: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  mobile: Joi.number(),
});

const login = async (req, res) => {
  const {
    username,
    password,
    isGoogleAuth = false,
    goggleAuthToken,
  } = req.body;
  const matchQuery = {};

  if (isGoogleAuth) {
    const ticket = await client.verifyIdToken({
      idToken: goggleAuthToken,
      audience: config.GOOGLE_LOGIN_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    matchQuery["email"] = payload.email;
  } else {
    if (!username || !password)
      return res.status(400).send("Username & Password is required.");

    matchQuery["username"] = username;
  }

  let user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("User not found.");

  if (!isGoogleAuth && !user.authenticate(password))
    return res.status(401).send("Invalid username/password.");

  user = user.toObject();
  const userInfoToSend = await extractUserData({ user, source: req.source });

  const token = signToken(user._id, user.email);

  res.send({ token, ...userInfoToSend });
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

  const projectId = new ObjectId();
  const defaultState = {
    timeline: {
      name: "Default",
      default: true,
      _id: projectId,
      createdAt: new Date().toISOString(),
    },
    expenseTypes: [
      { _id: new ObjectId(), key: "EXPENSE", label: "Expense" },
      { _id: new ObjectId(), key: "BILLS", label: "Bills" },
      { _id: new ObjectId(), key: "LOAN", label: "Lend" },
      { _id: new ObjectId(), key: "INVESTMENT", label: "Investment" },
      { _id: new ObjectId(), key: "INCOME", label: "Income" },
    ],
  };

  const { email, username } = req.body;
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) throw new Error("Email/Username already exists.");

  const result = await User.create({
    ...req.body,
    ...defaultState,
    source: req.source,
  });

  res.send({ result });
};

const checkAccountStatus = async (req, res) => {
  const result = await extractUserData(req);
  res.send(result);
};

module.exports = { login, register, checkAccountStatus };
