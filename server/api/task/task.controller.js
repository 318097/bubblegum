const moment = require("moment");
const Joi = require("@hapi/joi");
const { ObjectId } = require("mongoose").Types;

// const UserModel = require("../user/user.model");
const Model = require("./task.model");

const TaskSchemaValidator = Joi.object().keys({
  task: Joi.string().min(3).required(),
  type: Joi.string().regex(/^(SINGLE|WEEKLY)$/),
  frequency: Joi.number(),
});

exports.getAllTasks = async (req, res) => {
  const result = await Model.aggregate([
    { $match: { userId: req.user._id } },
    // {
    //   $group: { _id: '$type', 'todos': { $push: '$$ROOT' } }
    // },
    // { $replaceRoot: { newRoot: { $arrayToObject: [[{ k: '$_id', v: '$todos' }]] } } },
  ]);
  res.send({ todos: result });
};

exports.getTaskById = async (req, res) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ todo: result });
};

exports.createTask = async (req, res) => {
  const { task, type, frequency } = req.body;
  const { error } = Joi.validate(
    { task, type, frequency },
    TaskSchemaValidator
  );
  if (error) return res.status(400).send(error.details[0].message);

  let data;
  if (type === "WEEKLY") {
    const weekNo = moment().week();
    data = {
      stamps: { [`week-${weekNo}`]: [] },
      frequency,
    };
  }

  const result = await Model.create({
    task,
    type,
    userId: req.user._id,
    ...data,
  });
  res.send({ result });
};

exports.updateTask = async (req, res) => {
  const { task, type } = req.body;
  const todoId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: todoId,
    },
    {
      $set: {
        task,
        type,
        userId: req.user._id,
      },
    }
  );
  res.send({ result });
};

exports.stampTask = async (req, res) => {
  const { date, type } = req.body;
  const todoId = req.params.id;

  let expression;
  if (type === "WEEKLY") {
    const weekNo = moment(date).week();
    const week = `week-${weekNo}`;
    expression = {
      $addToSet: {
        [`stamps.${week}`]: moment(date).toDate(),
      },
    };
  } else {
    expression = {
      $set: {
        status: "COMPLETE",
        completionDate: date,
      },
    };
  }

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(todoId),
    },
    {
      ...expression,
    }
  );
  res.send({ result });
};

exports.deleteTask = async (req, res) => {
  const todoId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: todoId,
  });
  res.send({ result });
};
