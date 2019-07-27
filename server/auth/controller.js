const User = require('../api/user/model');
const signToken = require('./auth').signToken;

exports.signin = (req, res, next) => {
  var token = signToken(req.user._id);
  res.json({ token: token });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, username, password, email, mobile } = req.body;
    const result = await User.create({ name, username, password, email, mobile });
    res.send({ result })
  } catch (err) {
    next(err)
  }
}