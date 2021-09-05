const _ = require("lodash");
const moment = require("moment");
const { processId, generateDate } = require("../../helpers");
const TaskModel = require("./fireboard.task.model");
const ProjectModel = require("./fireboard.project.model");

const getDateEnds = (dateList) => {
  const list = _.map(dateList, "date");
  return {
    max: moment(_.first(list), "YYYY-MM-DD").endOf("day").toDate(),
    min: moment(_.last(list), "YYYY-MM-DD").startOf("day").toDate(),
  };
};

exports.getAllTasks = async (req, res) => {
  const { projectId } = req.query;

  const topics = await TaskModel.aggregate([
    {
      $match: {
        userId: req.user._id,
        projectId: processId(projectId),
        type: "TOPIC",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
  const visibleTopics = _.map(_.filter(topics, "visible"), "_id");

  const todos = await TaskModel.aggregate([
    {
      $match: {
        userId: req.user._id,
        type: "TODO",
        parentId: { $in: visibleTopics },
      },
    },
    { $sort: { marked: 1, createdAt: -1 } },
  ]);
  res.send({ todos, topics });
};

exports.getCompletedTasks = async (req, res) => {
  const { page = 1, limit = 10, projectId } = req.query;
  const aggregation = {
    userId: req.user._id,
    marked: true,
    type: "TODO",
    projectId: processId(projectId),
  };

  const dateList = await TaskModel.aggregate([
    { $match: aggregation },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$status.completedOn" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
      },
    },
    { $sort: { date: -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);
  const { max, min } = getDateEnds(dateList);

  const result = await TaskModel.aggregate([
    {
      $match: { ...aggregation, "status.completedOn": { $gt: min, $lt: max } },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$status.completedOn" },
        },
        todos: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        todos: 1,
      },
    },
    { $sort: { date: -1 } },
  ]);

  res.send({ timeline: result });
};

exports.getTaskById = async (req, res) => {
  const result = await TaskModel.find({
    userId: req.user._id,
    _id: req.params.id,
  });
  res.send({ todo: result });
};

exports.createTask = async (req, res) => {
  const { parentId, content, projectId, marked, deadline, type } = req.body;
  const userId = req.user._id;

  const data = {
    parentId,
    userId,
    content,
    projectId,
    marked,
    type,
    status: {
      deadline: deadline ? generateDate(deadline) : undefined,
      completedOn: marked ? generateDate() : undefined,
    },
  };

  const result = await TaskModel.create(data);
  await TaskModel.findOneAndUpdate(
    { _id: parentId, userId: req.user._id },
    {
      $push: {
        [`todos`]: result._id,
      },
    }
  );
  res.send({ result });
};

exports.updateTask = async (req, res) => {
  const { id: todoId } = req.params;
  const { deadline, start, stop, ...rest } = req.body;

  const updatedData = {};
  if (deadline) updatedData["status.deadline"] = deadline;
  if (start) updatedData["status.startedOn"] = generateDate();
  if (stop) updatedData["status.stoppedOn"] = generateDate();

  const result = await TaskModel.findOneAndUpdate(
    {
      _id: todoId,
      userId: req.user._id,
    },
    {
      $set: { ...rest, ...updatedData },
    },
    { new: true }
  );
  res.send({ result });
};

exports.stampTask = async (req, res) => {
  const { id } = req.params;
  const { marked } = req.body;
  const result = await TaskModel.findOneAndUpdate(
    {
      _id: id,
      userId: req.user._id,
    },
    {
      $set: {
        marked,
        "status.completedOn": marked ? generateDate() : null,
      },
    },
    {
      new: true,
    }
  );
  res.send({ result });
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const result = await TaskModel.findOneAndDelete({
    _id: id,
  });
  const { topicId } = result;

  await TaskModel.findOneAndUpdate(
    { _id: topicId, userId: req.user._id },
    { $pull: { todos: result._id } }
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

  await TaskModel.create({
    content: "Others",
    projectId: newProject._id,
    isDefault: true,
    userId,
    type: "TOPIC",
  });

  res.send({ newProject });
};
