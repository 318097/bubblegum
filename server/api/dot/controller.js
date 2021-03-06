const moment = require("moment");
const Model = require("./model");
const TopicsModel = require("./topicModel");
const UserModel = require("../user/model");
const _ = require("lodash");
const { ObjectId } = require("mongoose").Types;

exports.getAllTodos = async (req, res, next) => {
  const { projectId } = req.query;
  const topics = await TopicsModel.aggregate([
    { $match: { userId: req.user._id, projectId } },
  ]);
  const visibleTopics = _.map(_.filter(topics, "visible"), "_id");

  const todos = await Model.aggregate([
    { $match: { userId: req.user._id, topicId: { $in: visibleTopics } } },
  ]);
  res.send({ todos, topics });
};

exports.getCompletedTodos = async (req, res, next) => {
  const { page = 1, limit = 15, type = "TIMELINE", projectId } = req.query;
  let aggregation = { userId: req.user._id, marked: true, projectId };

  // if (type === "TODAY") {
  //   aggregation = {
  //     ...aggregation,
  //     completedOn: { $gte: moment().startOf("day") },
  //   };
  // } else {
  //   // type === 'TIMELINE'
  // }

  const result = await Model.aggregate([
    { $match: aggregation },
    { $sort: { completedOn: -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
    { $sort: { completedOn: 1 } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedOn" } },
        todos: { $push: "$$ROOT" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.send({ todos: result });
};

exports.getTodoById = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ todo: result });
};

exports.createTodo = async (req, res, next) => {
  const { topicId, content, projectId, marked } = req.body;
  const userId = req.user._id;

  const data = {
    topicId,
    content,
    userId,
    projectId,
    marked,
  };
  if (marked) data["completedOn"] = moment().toDate();
  const result = await Model.create(data);
  await TopicsModel.findOneAndUpdate(
    { _id: topicId },
    {
      $push: {
        [`todos`]: result._id,
      },
    }
  );
  res.send({ result });
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

exports.createTopic = async (req, res, next) => {
  const { content, projectId } = req.body;
  const userId = req.user._id;

  const result = await TopicsModel.create({
    content,
    projectId,
    userId,
  });
  res.send({ result });
};

exports.updateTopic = async (req, res, next) => {
  const { id: topicId } = req.params;
  const result = await TopicsModel.findOneAndUpdate(
    {
      _id: topicId,
    },
    {
      $set: req.body,
    },
    { new: true }
  );
  res.send({ result });
};

exports.createProject = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user._id;
  const projectId = new ObjectId();

  const newProject = {
    name,
    _id: projectId,
    createdAt: new Date().toISOString(),
  };
  const result = await UserModel.findByIdAndUpdate(
    { _id: userId },
    { $push: { dot: newProject } },
    { new: true }
  ).lean();

  await TopicsModel.create({
    content: "others",
    projectId,
    isDefault: true,
    userId,
  });

  res.send({ ...result });
};
