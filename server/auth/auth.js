const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("../../config");
const checkToken = expressJwt({ secret: "gumball" });
const User = require("../api/user/model");

const decodeToken = (req, res, next) => {
  if (req.headers && req.headers.hasOwnProperty("authorization")) {
    req.headers.authorization = "Bearer " + req.headers.authorization;
  }
  // this will call next if token is valid
  // and send error if its not. It will attached
  // the decoded token to req.user
  checkToken(req, res, next);
};

const getFreshUser = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    // if no user is found it was not
    // it was a valid JWT but didn't decode
    // to a real user in our DB. Either the user was deleted
    // since the client got the JWT, or
    // it was a JWT from some other source
    return res.status(401).send("Unauthorized");
  }
  // update req.user with fresh user from
  // stale token data
  req.user = user;
  next();
};

const verifyUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username & Password is required");

  const user = await User.findOne({ username });
  if (!user) return res.status(401).send("User not found");
  if (!user.authenticate(password))
    return res.status(401).send("Invalid username/password");
  req.user = user;
  next();
};

const signToken = _id => jwt.sign({ _id }, config.JWT);

const private = () => [decodeToken, getFreshUser];

module.exports = { decodeToken, getFreshUser, verifyUser, signToken, private };
