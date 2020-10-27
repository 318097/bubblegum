const moment = require("moment");
const Model = require("./model");
const TopicsModel = require("./topicModel");
const UserModel = require("../user/model");
const _ = require("lodash");
const uuid = require("uuid");

exports.getAllTodos = async (req, res, next) => {
  const projectId = req.params.id;

  const topics = await TopicsModel.aggregate([
    { $match: { userId: req.user._id, visible: true } },
  ]);
  const visibleTopics = _.map(topics, (topic) => topic._id);

  const todos = await Model.aggregate([
    { $match: { userId: req.user._id, topicId: { $in: visibleTopics } } },
  ]);
  res.send({ todos, topics });
};

exports.getCompletedTodos = async (req, res, next) => {
  const { page = 1, limit = 5, type = "TODAY" } = req.params;
  let aggregation = { userId: req.user._id, marked: true };

  if (type === "TODAY") {
    aggregation = {
      ...aggregation,
      completedOn: { $gte: moment().startOf("day") },
    };
  } else {
    // type === 'TIMELINE'
  }

  const result = await Model.aggregate([
    { $match: aggregation },
    { $sort: { completedOn: -1 } },
  ]);
  res.send({ todos: result });
};

exports.getTodoById = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ todo: result });
};

exports.createTodo = async (req, res, next) => {
  const { topicId, content, itemType, projectId } = req.body;
  const userId = req.user._id;

  if (itemType === "TOPIC") {
    const result = await TopicsModel.create({
      content,
      projectId,
      userId,
    });
    res.send({ result });
  } else {
    const result = await Model.create({
      topicId,
      content,
      userId,
    });
    await TopicsModel.findOneAndUpdate(
      { _id: topicId },
      {
        $push: {
          [`todos`]: result._id,
        },
      }
    );
    res.send({ result });
  }
};

exports.updateTodo = async (req, res, next) => {
  const { id: todoId } = req.params;
  const result = await Model.findOneAndUpdate(
    {
      _id: todoId,
    },
    {
      $set: req.body,
    },
    { new: true }
  );
  res.send({ result });
};

exports.stampTodo = async (req, res, next) => {
  const { id: todoId } = req.params;
  const result = await Model.findOneAndUpdate(
    {
      _id: todoId,
    },
    {
      $set: {
        marked: true,
        completedOn: moment().toDate(),
      },
    },
    {
      new: true,
    }
  );
  res.send({ result });
};

exports.deleteTodo = async (req, res, next) => {
  const { id: todoId } = req.params;
  const result = await Model.findOneAndDelete({
    _id: todoId,
  });
  const { topicId } = result;

  await TopicsModel.findOneAndUpdate(
    { _id: topicId },
    { $pull: { todos: result._id } }
  );
  res.send({ result });
};
