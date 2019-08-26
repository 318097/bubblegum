const User = require("../api/user/model");
const { signToken } = require("./auth");
const Joi = require("@hapi/joi");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const config = require("../../config");

const client = new OAuth2Client(config.GOOGLE_LOGIN_CLIENT_ID);

const RegisterSchemaValidator = Joi.object().keys({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required(),
  mobile: Joi.number()
});

exports.login = async (req, res) => {
  const {
    username,
    password,
    isGoogleAuth,
    goggleAuthToken = false
  } = req.body;
  const matchQuery = {};

  if (isGoogleAuth) {
    const ticket = await client.verifyIdToken({
      idToken: goggleAuthToken,
      audience: config.GOOGLE_LOGIN_CLIENT_ID
    });

    const payload = ticket.getPayload();
    matchQuery["email"] = payload.email;
  } else {
    if (!username || !password)
      return res.status(400).send("Username & Password is required");

    matchQuery["username"] = username;
  }

  const user = await User.findOne(matchQuery);

  if (!user) return res.status(401).send("User not found");

  if (!isGoogleAuth && !user.authenticate(password))
    return res.status(401).send("Invalid username/password");

  const token = signToken(user._id);
  res.json({ token });
};

exports.register = async (req, res) => {
  const data = _.pick(req.body, [
    "name",
    "username",
    "password",
    "email",
    "mobile"
  ]);
  const { error } = Joi.validate(data, RegisterSchemaValidator);

  if (error) return res.status(400).send(error.details[0].message);

  const result = await User.create(data);

  res.send({ result });
};
