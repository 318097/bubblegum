const Model = require('./model');
const _ = require('lodash');

exports.findById = (req, res, next, id) => {
  Model.findById(id).then(
    content => {
      if (!content) {
        next(new Error('No content found'));
      } else {
        req.content = content;
        next();
      }
    },
    err => next(err)
  );
};

exports.create = (req, res, next) => {
  let data = req.body;
  data['user_id'] = req.user._id;
  const content = new Model(data);

  content.save(function(err, content) {
    if (err) {
      return next(err);
    }
    res.json({ message: 'Content created' });
  });
};

exports.getAll = (req, res, next) => {
  Model.find({ user_id: req.user._id }).then(content => res.send(content));
};

exports.getOne = function(req, res, next) {
  const content = req.content;
  res.json(content);
};

exports.update = (req, res, next) => {
  const content = req.content;
  const update = req.body;
  _.merge(content, update);
  content.save(function(err, saved) {
    if (err) {
      next(err);
    } else {
      res.json(saved.toJson());
    }
  });
};

exports.delete = (req, res, next) => {
  req.content.remove((err, removed) => {
    if (err) {
      next(err);
    } else {
      res.json(removed);
    }
  });
};
