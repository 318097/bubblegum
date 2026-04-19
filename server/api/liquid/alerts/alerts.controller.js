import modelEntityMap from "../models.js";
import _ from "lodash";
import mongoose from "mongoose";

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
    const alerts = await modelEntityMap["alerts"]
      .aggregate([
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
      ])
      .sort({ createdAt: -1 });
    feed.push(...alerts);
  }

  if (["all", "activities"].includes(feedType)) {
    const activities = await modelEntityMap["activities"]
      .aggregate([
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
      ])
      .sort({ createdAt: -1 });
    feed.push(...activities);
  }

  res.send(_.orderBy(feed, "createdAt", "desc"));
}

async function getAlertDetailsById(req, res) {
  const { alertId } = req.params;
  const alert = await modelEntityMap["alerts"].findById(alertId);
  const aggregation = getAggregationFilters(alert);

  const users = await modelEntityMap["users"].aggregate([
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

  const msges = await modelEntityMap["alerts"].aggregate([
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
  const activities = await modelEntityMap["activities"].aggregate([
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

  // const count = await modelEntityMap['alerts'].find(aggregation).count();

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
  const result = await modelEntityMap["alerts"].create(msg);

  res.send(result);
}

export { getAlertsFeed, getAlertDetailsById, createAlertMessage };
