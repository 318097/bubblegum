const moment = require('moment');
const Joi = require('@hapi/joi');

const Model = require('./model');
const UserModel = require('../user/model');

const { ObjectId } = require('mongoose').Types;

const TodoSchemaValidator = Joi.object().keys({
  task: Joi.string().min(3).required(),
  type: Joi.string().regex(/^(SINGLE|WEEKLY)$/),
  frequency: Joi.number(),
});

exports.getAllTodos = async (req, res, next) => {
  const result = await Model.aggregate([
    { $match: { userId: req.user._id } },
    // {
    //   $group: { _id: '$type', 'todos': { $push: '$$ROOT' } }
    // },
    // { $replaceRoot: { newRoot: { $arrayToObject: [[{ k: '$_id', v: '$todos' }]] } } },
  ]);
  res.send({ todos: result });
};

exports.getTodoById = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ todo: result });
};

exports.createTodo = async (req, res, next) => {
  const weekNo = moment().week();
  const { task, type, frequency } = req.body;
  const { error } = Joi.validate({ task, type, frequency }, TodoSchemaValidator);
  if (error) return res.status(400).send(error.details[0].message);

  const result = await Model.create({
    task, type, frequency, userId: req.user._id, stamps: { [`week-${weekNo}`]: [] }
  });
  res.send({ result });
};

exports.updateTodo = async (req, res, next) => {
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
};

exports.stampTodo = async (req, res, next) => {
  const { date } = req.body;
  const weekNo = moment(date).week();
  const week = `week-${weekNo}`;
  const todoId = req.params.id;

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(todoId)
    }, {
      $addToSet: {
        [`stamps.${week}`]: moment(date)
      }
    }
  );
  res.send({ result });
};

exports.deleteTodo = async (req, res, next) => {
  const todoId = req.params.id;
  const result = await Model.findOneAndDelete(
    {
      _id: todoId
    }
  );
  res.send({ result });
};