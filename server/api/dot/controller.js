const moment = require("moment");
const Model = require("./model");
const UserModel = require("../user/model");

const { ObjectId } = require("mongoose").Types;

exports.getAllTodos = async (req, res, next) => {
  const result = await Model.aggregate([{ $match: { userId: req.user._id } }]);
  res.send({ todos: result });
};

exports.getTodoById = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ todo: result });
};

exports.createTodo = async (req, res, next) => {
  const { topicId, content } = req.body;

  const result = await Model.create({
    topicId,
    content,
    userId: req.user._id,
  });
  res.send({ result });
};

exports.updateTodo = async (req, res, next) => {
  const { content, topicId } = req.body;
  const todoId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: todoId,
    },
    {
      $set: {
        content,
        topicId,
        userId: req.user._id,
      },
    }
  );
  res.send({ result });
};

exports.stampTodo = async (req, res, next) => {
  const todoId = req.params.id;

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(todoId),
    },
    {
      $set: {
        marked: true,
        completedOn: moment().toDate(),
      },
    }
  );
  res.send({ result });
};

exports.deleteTodo = async (req, res, next) => {
  const todoId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: todoId,
  });
  res.send({ result });
};
