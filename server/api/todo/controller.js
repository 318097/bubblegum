const moment = require('moment');

const Model = require('./model');
const UserModel = require('../user/model');

exports.getAllTodos = async (req, res, next) => {
  try {
    const result = await Model.find({ userId: req.user._id });
    res.send({ todos: result });
  } catch (err) {
    next(err);
  }
};

exports.getTodoById = async (req, res, next) => {
  try {
    const result = await Model.find({ userId: req.user._id, _id: req.params.id });
    res.send({ todo: result });
  } catch (err) {
    next(err);
  }
};

exports.createTodo = async (req, res, next) => {
  try {
    const { task, type, frequency } = req.body;
    const result = await Model.create({
      task, type, frequency, userId: req.user._id
    });
    res.send({ result });
  } catch (err) {
    next(err);
  }
};

exports.updateTodo = async (req, res, next) => {
  try {
    const { task, type } = req.body;
    const todoId = req.params.id;
    const result = await Model.findOneAndUpdate(
      {
        _id: todoId
      }, {
        $set: {
          task, type, userId: req.user._id
        }
      }
    );
    res.send({ result });
  } catch (err) {
    next(err);
  }
};

exports.stampTodo = async (req, res, next) => {
  try {
    const { date } = req.body;
    const todoId = req.params.id;

    const result = await Model.findOneAndUpdate(
      {
        _id: todoId
      }, {
        $push: {
          stamps: date
        }
      }
    );
    res.send({ result });
  } catch (err) {
    next(err);
  }
};

exports.deleteTodo = async (req, res, next) => {
  try {
    const todoId = req.params.id;
    const result = await Model.findOneAndDelete(
      {
        _id: todoId
      }
    );
    res.send({ result });
  } catch (err) {
    next(err);
  }
};