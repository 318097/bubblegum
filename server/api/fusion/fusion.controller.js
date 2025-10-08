const _ = require("lodash");
// const mongoose = require("mongoose");
// const moment = require("moment");
// const { getKey } = require("../../utils/common");
const { AlertAndMsgModel, ActivitiesModel } = require("./fusion.model");
const UserModel = require("../user/user.model");

const USER_PROJECT = {
  _id: 1,
  uid: 1,
  name: 1,
  email: 1,
  username: 1,
  photoURL: 1,
};

const getAggregationFilters = (entity) => {
  const aggregation = {
    active: true,
    archived: false,
    deleted: false,
  };

  const filters =
    entity.type === "ALERT" ? ["activities", "days", "slots"] : [];

  filters.forEach(({ key }) => {
    const keyValue = entity[key];
    if (!_.isEmpty(keyValue))
      aggregation[key] = {
        $in: keyValue,
      };
  });

  return aggregation;
};

exports.getAllEntities = async (req, res) => {
  const alerts = await AlertAndMsgModel.find({
    type: "ALERT",
    deleted: false,
    userId: req.user._id,
  });

  const activities = await ActivitiesModel.find({
    deleted: false,
    userId: req.user._id,
  });

  res.send([...alerts, ...activities]);
};

exports.getEntityById = async (req, res) => {
  const { type } = req.query;
  const { entityId } = req.params;

  const query = {
    deleted: false,
    userId: req.user._id,
    _id: entityId,
  };

  let entity;
  if (type === "ALERT") {
    entity = await AlertAndMsgModel.find({
      ...query,
      type: "ALERT",
    });
  } else if (type === "ACTIVITY") {
    entity = await ActivitiesModel.find({
      ...query,
    });
  }

  res.send(entity);
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
    { $set: { ..._.omit(req.body, "_id") } }
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
  const aggregation = getAggregationFilters(alert);

  const users = await UserModel.aggregate([
    {
      $geoNear: {
        near: req.user.geoCoordinates,
        distanceField: "distance",
        maxDistance: parseInt(alert.radius) || 1000, // in meters
        spherical: true,
      },
    },
    {
      $lookup: {
        from: "alert-and-msges",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
            },
          },
          {
            $match: aggregation,
          },
        ],
        as: "alerts",
      },
    },
    {
      $match: {
        "alerts.0": { $exists: true }, // must have at least one alert
        _id: { $ne: req.user._id }, // exclude requesting user
      },
    },
    {
      $project: USER_PROJECT,
    },
  ]);

  const msges = await AlertAndMsgModel.aggregate([
    { $match: { ...aggregation, type: "MESSAGE" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        msg: 1,
        createdAt: 1,
        user: USER_PROJECT,
      },
    },
    // { $sort: sort },
    // {
    //   $skip: (Number(page) - 1) * Number(limit),
    // },
    // { $limit: Number(limit) },
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
    type: "MESSAGE",
  };
  const result = await AlertAndMsgModel.create(msg);

  res.send(result);
};
