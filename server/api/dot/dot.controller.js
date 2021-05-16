const moment = require("moment");
const _ = require("lodash");
const { processId } = require("../../helpers");
const TodoModel = require("./dot.todo.model");
const TopicModel = require("./dot.topic.model");
const ProjectModel = require("./dot.project.model");

exports.getAllTodos = async (req, res) => {
  const { projectId } = req.query;
  const topics = await TopicModel.aggregate([
    { $match: { userId: req.user._id, projectId: processId(projectId) } },
  ]);
  const visibleTopics = _.map(_.filter(topics, "visible"), "_id");

  const todos = await TodoModel.aggregate([
    { $match: { userId: req.user._id, topicId: { $in: visibleTopics } } },
  ]);
  res.send({ todos, topics });
};

exports.getCompletedTodos = async (req, res) => {
  const { page = 1, limit = 15, type = "TIMELINE", projectId } = req.query;
  let aggregation = {
    userId: req.user._id,
    marked: true,
    projectId: processId(projectId),
  };

  // if (type === "TODAY") {
  //   aggregation = {
  //     ...aggregation,
  //     completedOn: { $gte: moment().startOf("day") },
  //   };
  // } else {
  //   // type === 'TIMELINE'
  // }

  const result = await TodoModel.aggregate([
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

exports.getTodoById = async (req, res) => {
  const result = await TodoModel.find({
    userId: req.user._id,
    _id: req.params.id,
  });
  res.send({ todo: result });
};

exports.createTodo = async (req, res) => {
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
  const result = await TodoModel.create(data);
  await TopicModel.findOneAndUpdate(
    { _id: topicId },
    {
      $push: {
        [`todos`]: result._id,
      },
    }
  );
  res.send({ result });
};

exports.updateTodo = async (req, res) => {
  const { id: todoId } = req.params;
  const result = await TodoModel.findOneAndUpdate(
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

exports.stampTodo = async (req, res) => {
  const { id: todoId } = req.params;
  const result = await TodoModel.findOneAndUpdate(
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

exports.deleteTodo = async (req, res) => {
  const { id: todoId } = req.params;
  const result = await TodoModel.findOneAndDelete({
    _id: todoId,
  });
  const { topicId } = result;

  await TopicModel.findOneAndUpdate(
    { _id: topicId },
    { $pull: { todos: result._id } }
  );
  res.send({ result });
};

exports.createTopic = async (req, res) => {
  const { content, projectId } = req.body;
  const userId = req.user._id;

  const result = await TopicModel.create({
    content,
    projectId,
    userId,
  });
  res.send({ result });
};

exports.updateTopic = async (req, res) => {
  const { id: topicId } = req.params;
  const result = await TopicModel.findOneAndUpdate(
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

exports.createProject = async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id;

  const newProject = await ProjectModel.create({
    name,
    userId,
  });

  await TopicModel.create({
    content: "others",
    projectId: newProject._id,
    isDefault: true,
    userId,
  });

  if (!req.user.dotProjects) req.user.dotProjects = [];
  req.user.dotProjects.push(newProject);
  res.send({ ...req.user });
};
