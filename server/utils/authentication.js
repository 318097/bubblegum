const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const config = require("../config");
const User = require("../api/user/user.model");
const { getAppBasedInfo } = require("./common");

const getToken = (req) => _.get(req, "headers.authorization");

const signToken = (_id, email) =>
  jwt.sign({ _id, email }, config.JWT, { expiresIn: "30d" });

const appendUserInfo = async (req, user) => {
  const { _id } = user;
  const appBasedInfo = await getAppBasedInfo({ user, source: req.source });
  req.user = { ...user, ...appBasedInfo };

  req.userId = _id;
  req._id = _id;
  req.id = _id;
  req.status = _.get(user, "accountStatus.status");
  req.verified = _.get(user, "accountStatus.verified", false);
};

const validateToken = (token) => {
  try {
    if (!token) return;
    return jwt.verify(token, config.JWT);
  } catch (error) {
    throw new Error("INVALID_JWT_TOKEN");
  }
};

const getUser = (_id) => User.findById(_id).lean();

const getUserFromToken = async (token) => {
  const { _id } = validateToken(token) || {};
  return await getUser(_id);
};

const decodeToken = (req, res, next) => {
  /* this will call next() if token is valid or send error.& attached the decoded token to `req.user` */
  const checkToken = expressJwt({ secret: config.JWT });
  checkToken(req, res, next);
};

const extractUser = async (req, res, next) => {
  const user = await getUser(req.user._id);

  /* if no user is found, it was a valid JWT but didn't decode to a real user in DB
  Either the user was deleted or it was a JWT from some other source */
  if (!user) return res.status(401).send("UNAUTHORIZED");

  await appendUserInfo(req, user);
  next();
};

const transparent = async (req, res, next) => {
  const { token } = req;

  if (token) {
    const user = await getUserFromToken(token);
    await appendUserInfo(req, user);
  }

  next();
};

const temporaryAccess = async (req, res, next) => {
  req.user = await User.findOne({ email: "318097@gmail.com" }).lean();
  next();
};

// const externalAccess = async (req, res, next) => {
//   if (!req.validSource)
//     return res.status(401).send("Unauthorized: Invalid source.");

//   const token = getToken(req);
//   if (token) {
//     req.user = validateToken(token);
//     extractUser(req, res, next);
//   } else {
//     req.user = await User.findOne({ email: "318097@gmail.com" }).lean();
//     next();
//   }
// };

const protectedRoute = [decodeToken, extractUser];

module.exports = {
  signToken,
  validateToken,
  // externalAccess,
  temporaryAccess,
  protectedRoute,
  transparent,
  getUserFromToken,
  getToken,
};
