const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const config = require("../config");
const { APP_LIST } = require("../constants");
const User = require("../api/user/user.model");

const signToken = (_id, email) => jwt.sign({ _id, email }, config.JWT);

const validateToken = (token) => jwt.verify(token, config.JWT);

const decodeToken = (req, res, next) => {
  const token = _.get(req, "headers.authorization");
  if (token) req.headers.authorization = `Bearer ${token}`;

  /* this will call next() if token is valid or send error.& attached the decoded token to `req.user` */
  const checkToken = expressJwt({ secret: config.JWT });
  checkToken(req, res, next);
};

const extractUser = async (req, res, next) => {
  const user = await User.findById(req.user._id).lean();

  /* if no user is found, it was a valid JWT but didn't decode to a real user in DB
  Either the user was deleted or it was a JWT from some other source */
  if (!user) return res.status(401).send("Unauthorized");

  req.user = user;
  next();
};

const externalAccess = async (req, res, next) => {
  if (!req.source) return res.status(401).send("Unauthorized Access.");

  if (!APP_LIST.includes(req.source))
    return res.status(401).send("Unauthorized: Invalid source.");

  if (req.headers["authorization"]) {
    req.user = validateToken(req.headers.authorization);
    extractUser(req, res, next);
  } else {
    req.user = await User.findOne({ email: "318097@gmail.com" }).lean();
    next();
  }
};

const transparent = async (req, res, next) => {
  const token = _.get(req, "headers.authorization");
  if (token) {
    const decoded = validateToken(token);
    req.user = await User.findOne({ _id: decoded._id });
  }
  next();
};

const protectedRoute = [decodeToken, extractUser];

module.exports = {
  signToken,
  validateToken,
  externalAccess,
  protectedRoute,
  transparent,
};
