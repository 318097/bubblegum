const User = require('../api/user/model');
const signToken = require('./auth').signToken;
const Joi = require('@hapi/joi');
const _ = require('lodash');

const RegisterSchemaValidator = Joi.object().keys({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  mobile: Joi.number(),
});

exports.login = (req, res) => {
  const token = signToken(req.user._id);
  res.json({ token });
};

exports.register = async (req, res) => {
  const data = _.pick(req.body, [name, 'username', 'password', 'email', 'mobile']);
  const { error } = Joi.validate(data, RegisterSchemaValidator);
  if (error) return res.status(400).send(error.details[0].message);

  const result = await User.create(data);
  res.send({ result });
}