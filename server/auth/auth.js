const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("../../config");
const { APP_LIST } = require("../../constants");
const User = require("../api/user/model");

const checkToken = expressJwt({ secret: config.JWT });

const decodeToken = (req, res, next) => {
  if (req.headers && req.headers.hasOwnProperty("authorization")) {
    req.headers.authorization = "Bearer " + req.headers.authorization;
  }
  /* this will call next() if token is valid or send error.& attached the decoded token to `req.user` */
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
  if (!req.headers || !req.headers.hasOwnProperty("external-source"))
    return res.status(401).send("Unauthorized Access.");

  const source = req.headers["external-source"];
  if (!APP_LIST.includes(source))
    return res.status(401).send("Unauthorized: Invalid source.");

  if (req.headers["authorization"]) {
    const decoded = jwt.verify(req.headers.authorization, config.JWT);
    req.user = decoded;
    extractUser(req, res, next);
  } else {
    const user = await User.findOne({ email: "318097@gmail.com" }).lean();
    req.user = user;
    next();
  }
};

const transparent = async (req, res, next) => {
  const token = req.headers.authorization || "";
  if (token) {
    const decoded = validateToken(token);
    const user = await User.findOne({ _id: decoded._id });
    req.user = user;
  }
  next();
};

const signToken = (_id) => jwt.sign({ _id }, config.JWT);

const validateToken = (token) => jwt.verify(token, config.JWT);

const protected = [decodeToken, extractUser];

module.exports = {
  signToken,
  validateToken,
  externalAccess,
  protected,
  transparent,
};
