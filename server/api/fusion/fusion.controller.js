const _ = require("lodash");
// const mongoose = require("mongoose");
// const moment = require("moment");
// const { getKey } = require("../../utils/common");
const {
  AlertAndMsgModel,
  ActivitiesModel,
  EditablesModel,
} = require("./fusion.model");
const UserModel = require("../user/user.model");

const modelEntityMap = {
  alerts: AlertAndMsgModel,
  activities: ActivitiesModel,
  editables: EditablesModel,
};

const USER_PROJECT = {
  _id: 1,
  uid: 1,
  name: 1,
  email: 1,
  username: 1,
  photoURL: 1,
};

const USER_UNPROJECT = {
  accountStatus: 0,
  bookmarkedPosts: 0,
  userType: 0,
  password: 0,
  source: 0,
  appStatus: 0,
};

const getAggregationFilters = (entity) => {
  const aggregation = {
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

exports.getAlertsFeed = async (req, res) => {
  const { feedType = "all" } = req.query;

  const feed = [];

  if (["all", "alerts"].includes(feedType)) {
    const alerts = await AlertAndMsgModel.aggregate([
      {
        $match: {
          type: "ALERT",
          deleted: false,
          userId: { $ne: req.user._id },
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
      {
        $project: {
          user: USER_UNPROJECT,
        },
      },
    ]).sort({ createdAt: -1 });
    feed.push(...alerts);
  }

  if (["all", "alerts"].includes(feedType)) {
    const activities = await ActivitiesModel.aggregate([
      {
        $match: {
          deleted: false,
          userId: { $ne: req.user._id },
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
      {
        $project: {
          user: USER_UNPROJECT,
        },
      },
    ]).sort({ createdAt: -1 });
    feed.push(...activities);
  }

  res.send(feed);
};

exports.getAllEntities = async (req, res) => {
  const { entityType } = req.params;

  if (entityType === "alerts") {
    const alerts = await AlertAndMsgModel.find({
      type: "alerts",
      deleted: false,
      userId: req.user._id,
    });

    const activities = await ActivitiesModel.find({
      deleted: false,
      userId: req.user._id,
    });

    res.send([...alerts, ...activities]);
  } else if (entityType === "editables") {
    const editables = await EditablesModel.find({
      deleted: false,
      userId: req.user._id,
    });

    res.send(editables);
  }
};

exports.getEntityById = async (req, res) => {
  const { entityId, entityType } = req.params;

  const query = {
    deleted: false,
    userId: req.user._id,
    _id: entityId,
  };

  let entity;
  if (entityType === "alerts") {
    entity = await AlertAndMsgModel.find({
      ...query,
      entityType: "alerts",
    });
  } else if (entityType === "activities") {
    entity = await ActivitiesModel.find({
      ...query,
    });
  }

  res.send(entity);
};

exports.createEntity = async (req, res) => {
  const { _id } = req.user;
  const { entityType } = req.params;

  const entity = {
    userId: _id,
    ...req.body,
  };

  const result = await modelEntityMap[entityType].create(entity);

  res.send(result);
};

exports.updateEntity = async (req, res) => {
  const { entityId, entityType } = req.params;

  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];
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
  const { entityId, entityType } = req.params;
  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];

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
    { $match: { ...aggregation, type: "message" } },
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
    type: "message",
  };
  const result = await AlertAndMsgModel.create(msg);

  res.send(result);
};
