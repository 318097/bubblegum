const moment = require("moment");
const Joi = require("@hapi/joi");

const Model = require("./model");
const UserModel = require("../user/model");

const { ObjectId } = require("mongoose").Types;

const TodoSchemaValidator = Joi.object().keys({
  task: Joi.string()
    .min(3)
    .required(),
  type: Joi.string().regex(/^(SINGLE|WEEKLY)$/),
  frequency: Joi.number()
});

exports.getAllTodos = async (req, res, next) => {
  const result = await Model.aggregate([
    { $match: { userId: req.user._id } }
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
  const { task, type, frequency } = req.body;
  const { error } = Joi.validate(
    { task, type, frequency },
    TodoSchemaValidator
  );
  if (error) return res.status(400).send(error.details[0].message);

  let data;
  if (type === "WEEKLY") {
    const weekNo = moment().week();
    data = {
      stamps: { [`week-${weekNo}`]: [] },
      frequency
    };
  }

  const result = await Model.create({
    task,
    type,
    userId: req.user._id,
    ...data
  });
  res.send({ result });
};

exports.updateTodo = async (req, res, next) => {
  const { task, type } = req.body;
  const todoId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: todoId
    },
    {
      $set: {
        task,
        type,
        userId: req.user._id
      }
    }
  );
  res.send({ result });
};

exports.stampTodo = async (req, res, next) => {
  const { date, type } = req.body;
  const todoId = req.params.id;

  let expression;
  if (type === "WEEKLY") {
    const weekNo = moment(date).week();
    const week = `week-${weekNo}`;
    expression = {
      $addToSet: {
        [`stamps.${week}`]: moment(date).toDate()
      }
    };
  } else {
    expression = {
      $set: {
        status: "COMPLETE",
        completionDate: date
      }
    };
  }

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(todoId)
    },
    {
      ...expression
    }
  );
  res.send({ result });
};

exports.deleteTodo = async (req, res, next) => {
  const todoId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: todoId
  });
  res.send({ result });
};
