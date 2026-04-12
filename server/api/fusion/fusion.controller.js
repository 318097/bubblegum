import _ from "lodash";
import mongoose from "mongoose";

// const moment = require("moment");
// const { getKey } = require("../../utils/common");
import {
  AlertAndMsgModel,
  ActivitiesModel,
  EditablesModel,
  DynamicModel,
  LynkCollectionModel,
  LynksModel,
  HabitsModel,
} from "./fusion.model.js";

import UserModel from "../user/user.model.js";

const modelEntityMap = {
  alerts: AlertAndMsgModel,
  activities: ActivitiesModel,
  editables: EditablesModel,
  dynamic: DynamicModel,
  links: LynkCollectionModel,
  habits: HabitsModel,
};

const USER_PROJECT = {
  _id: 1,
  uid: 1,
  name: 1,
  email: 1,
  username: 1,
  photoURL: 1,
  displayLocation: 1,
  contact: 1,
  interests: 1,
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

async function getAlertsFeed(req, res) {
  const { feedType = "all" } = req.query;

  const feed = [];

  if (["all", "alerts"].includes(feedType)) {
    const alerts = await AlertAndMsgModel.aggregate([
      {
        $match: {
          type: "alerts",
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

  if (["all", "activities"].includes(feedType)) {
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

  res.send(_.orderBy(feed, "createdAt", "desc"));
}

async function getAllEntities(req, res) {
  const { entityType } = req.params;

  if (entityType === "alerts") {
    const alerts = await AlertAndMsgModel.find({
      type: "alerts",
      deleted: false,
      userId: req.user._id,
    });

    res.send(alerts);
  } else {
    const collection = modelEntityMap[entityType];
    const entities = await collection.find({
      deleted: false,
      userId: req.user._id,
    });

    res.send(entities);
  }
}

async function getEntityById(req, res) {
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
}

async function createEntity(req, res) {
  const { _id } = req.user;
  const { entityType } = req.params;

  const entity = {
    userId: _id,
    ...req.body,
  };

  if (entityType === "dynamic") {
    entity["api"] = `/notion/vocab`;
    entity["apiParams"] = {
      cursor: undefined,
    };
    entity["refreshDuration"] = 60 * 60 * 8; // 8 hours
  }

  const result = await modelEntityMap[entityType].create(entity);

  res.send(result);
}

async function updateEntity(req, res) {
  const { entityId, entityType } = req.params;

  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];
  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { ..._.omit(req.body, "_id") } },
  );
  res.send({ result });
}

async function deleteEntity(req, res) {
  const { entityId, entityType } = req.params;
  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];

  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { deleted: true } },
  );
  res.send({ result });
}

async function getAlertDetailsById(req, res) {
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
}

async function createAlertMessage(req, res) {
  const { _id } = req.user;

  const msg = {
    userId: _id,
    ...req.body,
    type: "message",
  };
  const result = await AlertAndMsgModel.create(msg);

  res.send(result);
}

async function createOrUpdateLink(req, res) {
  const { _id } = req.user;

  const link = {
    ...req.body,
    userId: _id,
    collectionId: req.params.collectionId,
    slug: req.body.slug,
    deleted: false,
    archived: false,
    isBubblegumServer: true,
  };
  const result = await LynksModel.findOneAndUpdate(
    { _id: req.body._id || new mongoose.Types.ObjectId() },
    {
      $set: link,
    },
    {
      upsert: true,
      new: true,
    },
  );

  res.send(result);
}

async function deleteLink(req, res) {
  const { linkId, collectionId } = req.params;
  const { _id: userId } = req.user;

  const result = await LynksModel.findOneAndUpdate(
    {
      _id: linkId,
      userId,
      collectionId,
    },
    { $set: { deleted: true } },
  );
  res.send({ result });
}

async function getLynksByCollectionId(req, res) {
  const { _id } = req.user;

  const result = await LynksModel.aggregate([
    {
      $match: {
        userId: _id,
        deleted: false,
        // collectionId: req.params.collectionId,
      },
    },
  ]);

  res.send(result);
}

async function resolveShortLink(req, res) {
  const { path } = req.params;

  const [collection, ...slug] = path.split("::");

  const lynkCollection = await LynkCollectionModel.findOne({
    label: collection.trim().toLowerCase(),
    // collectionId: req.params.collectionId,
  });
  console.log("lynkCollection::-", lynkCollection._id);

  const result = await LynksModel.findOne({
    collectionId: lynkCollection._id,
    slug: `${slug.join("/")}`,
    // collectionId: req.params.collectionId,
  });

  // TODO: limit the content that is sent back, and also add analytics for the same
  res.send(result);
}

export {
  getAlertsFeed,
  getAllEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  getAlertDetailsById,
  createAlertMessage,
  createOrUpdateLink,
  deleteLink,
  getLynksByCollectionId,
  resolveShortLink,
};
