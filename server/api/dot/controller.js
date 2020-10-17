const moment = require("moment");
const Model = require("./model");
const UserModel = require("../user/model");
const _ = require("lodash");
const uuid = require("uuid");

const { ObjectId } = require("mongoose").Types;

exports.getAllTodos = async (req, res, next) => {
  const settings = _.get(req, "user.dot", []);
  // const topicIds = _.map(
  //   _.filter(settings, (setting) => setting.visible, "content")
  // );
  const topicIds = _.map(settings, "id");

  const result = await Model.aggregate([
    { $match: { userId: req.user._id, topicIds: { $in: topicIds } } },
  ]);
  res.send({ todos: result });
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
  const { topicId = "others", content, itemType } = req.body;
  const userId = req.user._id;

  let result;
  if (itemType === "TOPIC") {
    const newTopic = {
      _id: uuid(),
      content,
      createdAt: new Date().toISOString(),
      todos: [],
      visible: true,
    };
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          dot: newTopic,
        },
      }
    );
    result = newTopic;
  } else {
    result = await Model.create({
      topicId,
      content,
      userId,
    });
    await UserModel.findOneAndUpdate(
      { _id: userId, "dot._id": topicId },
      {
        $push: {
          [`dot.$.todos`]: result._id,
        },
      }
    );
  }
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
