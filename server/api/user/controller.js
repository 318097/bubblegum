const Model = require('./model');
const _ = require('lodash');
var signToken = require('../../auth/auth').signToken;

exports.findById = (req, res, next, id) => {
  Model.findById(id)
    .select('-password')
    .exec()
    .then(
      user => {
        if (!user) {
          next(new Error('No user found'));
        } else {
          req.user = user;
        }
      },
      err => next(err)
    );
};

exports.create = (req, res, next) => {
  var newUser = new Model(req.body);

  newUser.save(function(err, user) {
    if (err) {
      return next(err);
    }

    var token = signToken(user._id);
    res.json({ token: token });
  });
};

exports.getAll = (req, res, next) => {
  Model.find({})
    .select('-password')
    .exec()
    .then(users => res.send(users));
};

exports.getOne = function(req, res, next) {
  const user = req.user;
  res.json(user);
};

exports.update = (req, res, next) => {
  var user = req.user;

  var update = req.body;

  _.merge(user, update);

  user.save(function(err, saved) {
    if (err) {
      next(err);
    } else {
      res.json(saved.toJson());
    }
  });
};

exports.delete = (req, res, next) => {
  req.user.remove((err, removed) => {
    if (err) {
      next(err);
    } else {
      res.json(removed);
    }
  });
};

exports.me = function(req, res) {
  res.json(req.user.toJson());
};

exports.getResume = function(req, res) {
  Model.findOne({ username: req.params.username }).then(user => {
    res.json(user.about ? user.about : {});
  });
};

exports.updateResume = function(req, res) {
  let user = req.user;
  user.about = req.body;
  user.save((err, saved) => {
    if (err) {
      next(err);
    } else {
      res.json(saved.toJson());
    }
  });
};
