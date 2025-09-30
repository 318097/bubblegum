const _ = require("lodash");
// const mongoose = require("mongoose");
// const moment = require("moment");
// const UserModel = require("../user/user.model");
// const { getKey } = require("../../utils/common");
const { AlertAndMsgModel, ActivitiesModel } = require("./fusion.model");

const alertFilters = [
  {
    key: "activities",
  },
  {
    key: "days",
  },
  {
    key: "slots",
  },
];

const activitiesFilters = [];

const getAggregationFilters = (alert, filter = "ALERT") => {
  const { limit = 250, page = 1, sortOrder, sortFilter, type, _id } = alert;

  // TODO: add filter to match with unique users & alert should not be off or disabled.
  const aggregation = {
    _id: { $ne: _id },
  };

  let sort = {
    createdAt: 1,
  };

  const filters = filter === "ALERT" ? alertFilters : activitiesFilters;

  filters.forEach(({ key }) => {
    const keyValue = alert[key];
    if (!_.isEmpty(keyValue))
      aggregation[key] = {
        $in: keyValue,
      };
  });

  // sort = {
  //   [sortFilter]: sortOrder === "ASC" ? 1 : -1,
  // };

  return { aggregation, sort, page, limit };
};

exports.getAllEntities = async (req, res) => {
  const alerts = await AlertAndMsgModel.find({
    isAlert: true,
    deleted: false,
    userId: req.user._id,
    status: "ACTIVE",
  });

  const activities = await ActivitiesModel.find({
    deleted: false,
    userId: req.user._id,
    // status: "ACTIVE",
  });

  res.send(
    [...alerts, ...activities].map((a) => ({
      ...a.toObject(),
      id: a._id,
      level: 1,
    }))
  );
};

exports.createEntity = async (req, res) => {
  const { _id } = req.user;
  const { type } = req.body;

  const entity = {
    userId: _id,
    ...req.body,
  };

  const result =
    type === "ACTIVITY"
      ? await ActivitiesModel.create(entity)
      : await AlertAndMsgModel.create(entity);

  res.send(result);
};

exports.updateEntity = async (req, res) => {
  const { entityId } = req.params;
  const { type } = req.query;
  const { _id: userId } = req.user;

  const collection = type === "ACTIVITY" ? ActivitiesModel : AlertAndMsgModel;
  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { ...req.body } }
  );
  res.send({ result });
};

exports.deleteEntity = async (req, res) => {
  const { entityId } = req.params;
  const { type } = req.query;
  const { _id: userId } = req.user;

  const collection = type === "ACTIVITY" ? ActivitiesModel : AlertAndMsgModel;

  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { deleted: true } }
  );
  res.send({ result });
};

exports.getAlertDetailsById = async (req, res) => {
  const { alertId } = req.params;
  const alert = await AlertAndMsgModel.findById(alertId);
  const { aggregation, sort, page, limit } = getAggregationFilters(alert);

  // find all unique users (excluding self), and send back only user profile
  const users = await AlertAndMsgModel.aggregate([
    { $match: { ...aggregation, isAlert: true } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  const msges = await AlertAndMsgModel.aggregate([
    { $match: { ...aggregation, isAlert: false } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $sort: sort },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    { $limit: Number(limit) },
  ]);

  // find all unique users (excluding self), and send back only user profile
  const activities = await ActivitiesModel.aggregate([
    {
      $match: {
        activities: { $in: alert.activities },
        day: { $in: alert.days },
        // time: {$in: alert.time },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  // const count = await AlertAndMsgModel.find(aggregation).count();

  res.send({
    users,
    msges,
    activities,
    // meta: { count },
  });
};

exports.createAlertMessage = async (req, res) => {
  const { _id } = req.user;

  const msg = {
    userId: _id,
    ...req.body,
    isAlert: false,
  };
  const result = await AlertAndMsgModel.create(msg);

  res.send(result);
};
