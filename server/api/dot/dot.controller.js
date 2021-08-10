const _ = require("lodash");
const { processId, generateDate } = require("../../helpers");
const TaskModel = require("./dot.task.model");
const ProjectModel = require("./dot.project.model");

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
  const { page = 1, limit = 15, projectId } = req.query;
  let aggregation = {
    userId: req.user._id,
    marked: true,
    type: "TODO",
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

  const result = await TaskModel.aggregate([
    { $match: aggregation },
    { $sort: { completedOn: -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
    { $sort: { completedOn: 1 } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$status.completedOn" },
        },
        todos: { $push: "$$ROOT" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.send({ todos: result });
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
    { _id: parentId },
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
  const { deadline, ...rest } = req.body;
  const updatedStatus = deadline ? { "status.deadline": deadline } : {};

  const result = await TaskModel.findOneAndUpdate(
    {
      _id: todoId,
    },
    {
      $set: { ...rest, ...updatedStatus },
    },
    { new: true }
  );
  res.send({ result });
};

exports.stampTask = async (req, res) => {
  const { id } = req.params;
  const result = await TaskModel.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        marked: true,
        "status.completedOn": generateDate(),
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
    { _id: topicId },
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
    content: "others",
    projectId: newProject._id,
    isDefault: true,
    userId,
    type: "TOPIC",
  });

  res.send({ newProject });
};
