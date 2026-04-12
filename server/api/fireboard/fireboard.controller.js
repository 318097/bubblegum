import _ from "lodash";
import moment from "moment";
import { processId, generateDate } from "../../utils/common.js";
import TaskModel from "./fireboard.task.model.js";
import ProjectModel from "./fireboard.project.model.js";

const getDateEnds = (dateList) => {
  const list = _.map(dateList, "date");
  return {
    max: moment(_.first(list), "YYYY-MM-DD").endOf("day").toDate(),
    min: moment(_.last(list), "YYYY-MM-DD").startOf("day").toDate(),
  };
};

async function getAllTasks(req, res) {
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
}

async function getCompletedTasks(req, res) {
  const { page = 1, limit = 10, projectId } = req.query;
  const aggregation = {
    userId: req.user._id,
    marked: true,
    type: "TODO",
    projectId: processId(projectId),
  };

  const [dateListObj] = await TaskModel.aggregate([
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
    {
      $facet: {
        count: [{ $count: "total" }],
        dateList: [
          { $sort: { date: -1 } },
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
        ],
      },
    },
  ]);

  const total = _.get(dateListObj, "count.0.total", 0);
  const next = (page - 1) * limit + _.size(dateListObj.dateList) < total;

  const { max, min } = getDateEnds(dateListObj.dateList);

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

  res.send({
    timeline: result,
    next,
  });
}

async function getTaskById(req, res) {
  const result = await TaskModel.find({
    userId: req.user._id,
    _id: req.params.id,
  });
  res.send({ todo: result });
}

async function createTask(req, res) {
  const { parentId, content, projectId, marked, deadline, type } = req.body;
  const userId = req.user._id;

  const extra =
    type === "TOPIC"
      ? { todos: [], isDefault: false, visible: true }
      : { marked: !!marked, parentId };
  const data = {
    userId,
    content,
    projectId,
    type,
    status: {
      deadline: deadline ? generateDate(deadline) : undefined,
      completedOn: marked ? generateDate() : undefined,
    },
    ...extra,
  };

  const result = await TaskModel.create(data);
  await TaskModel.findOneAndUpdate(
    { _id: parentId, userId: req.user._id },
    {
      $push: {
        [`todos`]: result._id,
      },
    },
  );
  res.send({ result });
}

async function updateTask(req, res) {
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
    { new: true },
  );
  res.send({ result });
}

async function stampTask(req, res) {
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
    },
  );
  res.send({ result });
}

async function deleteTask(req, res) {
  const { id } = req.params;
  const result = await TaskModel.findOneAndDelete({
    _id: id,
  });
  const { topicId } = result;

  await TaskModel.findOneAndUpdate(
    { _id: topicId, userId: req.user._id },
    { $pull: { todos: result._id } },
  );
  res.send({ result });
}

async function createProject(req, res) {
  const { name } = req.body;
  const userId = req.user._id;

  const newProject = await ProjectModel.create({
    name,
    userId,
  });

  await TaskModel.create({
    content: "Uncategorized",
    projectId: newProject._id,
    isDefault: true,
    visible: true,
    userId,
    type: "TOPIC",
  });

  res.send({ newProject });
}

export {
  getAllTasks,
  getCompletedTasks,
  getTaskById,
  createTask,
  updateTask,
  stampTask,
  deleteTask,
  createProject,
};
