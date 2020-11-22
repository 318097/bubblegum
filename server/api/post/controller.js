const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");
const Model = require("./model");
const UserModel = require("../user/model");
const {
  getKey,
  generateNewResourceId,
  generateSlug,
  isSearchId,
} = require("./utils");

const { ObjectId } = mongoose.Types;

exports.getRelatedPosts = async (req, res, next) => {
  const { collectionId, tags = [], postId } = req.query;
  const aggregation = {
    status: "POSTED",
    visible: true,
    isAdmin: true,
    deleted: false,
    collectionId,
    _id: { $ne: ObjectId(postId) },
  };
  if (tags.length) aggregation["tags"] = { $in: tags };

  const posts = await Model.aggregate([
    {
      $match: aggregation,
    },
    { $sample: { size: 3 } },
  ]);
  res.send({ posts });
};

exports.getChains = async (req, res, next) => {
  const { _id } = req.user;
  const { collectionId } = req.query;
  const chains = await Model.aggregate([
    {
      $match: {
        type: "CHAIN",
        collectionId,
        userId: _id,
        status: { $nin: ["POSTED"] },
      },
    },
  ]);
  res.send({ chains });
};

exports.getAllPosts = async (req, res, next) => {
  const {
    search,
    limit = 10,
    page = 1,
    tags = [],
    status,
    socialStatus,
    visibility,
    collectionId,
    sortOrder,
    sortFilter,
    rating,
    type,
  } = req.query;

  const aggregation = {
    collectionId,
    deleted: false,
  };
  // need to sort by _id because when bulk creation is done, all the post have same timestamp and during fetching it results in different sort order if its only sorted by `createdAt`
  let sort = {
    _id: -1,
    createdAt: -1,
  };

  if (tags.length)
    aggregation["tags"] = {
      $in: [].concat(tags),
    };

  if (search) {
    const searchTypeIsId = isSearchId(search);
    if (searchTypeIsId) {
      const key = status === "POSTED" ? "liveId" : "index";
      aggregation[key] = Number(search.trim());
    } else {
      const regex = new RegExp(search, "gi");
      aggregation["$or"] = [
        {
          title: {
            $regex: regex,
          },
        },
        {
          content: {
            $regex: regex,
          },
        },
      ];
    }
  }

  if (req.source === "NOTES_APP") {
    const { _id } = req.user;
    aggregation["userId"] = _id;

    if (status) aggregation["status"] = status;
    if (rating) aggregation["rating"] = Number(rating);
    if (type) aggregation["type"] = type;
    if (socialStatus) aggregation["socialStatus"] = socialStatus;
    if (visibility) aggregation["visible"] = visibility === "visible";
    if (sortFilter)
      sort = {
        [sortFilter]: sortOrder === "ASC" ? 1 : -1,
      };
  } else {
    aggregation.isAdmin = true;
    aggregation.status = "POSTED";
    aggregation.visible = true;
    sort = {
      liveId: -1,
    };
  }

  const result = await Model.aggregate([
    { $match: aggregation },
    {
      $lookup: {
        from: "posts",
        localField: "chainedItems",
        foreignField: "_id",
        as: "chainedPosts",
      },
    },
    { $sort: sort },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    { $limit: Number(limit) },
  ]);

  const count = await Model.find(aggregation).count();
  res.send({
    posts: result,
    meta: { count },
  });
};

exports.getPostById = async (req, res, next) => {
  const { id } = req.params;
  const { collectionId } = req.query;
  const key = getKey(id);
  const aggregation = {
    [key]: key === "_id" ? ObjectId(id) : id,
    collectionId,
  };

  if (req.source === "NOTES_APP") {
    const { _id } = req.user;
    aggregation["userId"] = _id;
  } else {
    aggregation.isAdmin = true;
    aggregation.status = "POSTED";
    aggregation.visible = true;
  }

  const [result] = await Model.aggregate([
    { $match: aggregation },
    {
      $lookup: {
        from: "posts",
        localField: "chainedItems",
        foreignField: "_id",
        as: "chainedPosts",
      },
    },
  ]);
  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { data } = req.body;
  const { collectionId } = req.query;
  const { _id, userType } = req.user;
  const currentCollection = _.get(req, ["user", "notesApp", collectionId], {});
  let index = _.get(currentCollection, "index", 1);

  const posts = [].concat(data).map((item) => {
    const slug = generateSlug({ title: item.title });
    index++;
    const resourceId = generateNewResourceId({ slug, index });
    return {
      ...item,
      userId: _id,
      isAdmin: userType === "ADMIN",
      index,
      collectionId,
      slug,
      resources: [resourceId],
    };
  });

  const result = await Model.create(posts);

  await UserModel.findOneAndUpdate(
    { _id },
    { $set: { [`notesApp.${collectionId}.index`]: index } }
  );

  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const { id } = req.params;
  const key = getKey(id);
  const { action, collectionId } = req.query;
  const { status, liveId, chainedTo, updatedChainedTo } = req.body;
  const { user } = req;
  const { _id: userId } = user;
  let query;
  const updatedData = {
    ...req.body,
    chainedTo: updatedChainedTo,
  };

  if (!liveId && status === "POSTED") {
    const collectionLiveIndex = _.get(
      user,
      ["notesApp", collectionId, "liveId"],
      0
    );
    updatedData["liveId"] = collectionLiveIndex;
    updatedData["publishedAt"] = moment().toISOString();

    await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { [`notesApp.${collectionId}.liveId`]: collectionLiveIndex + 1 } }
    );
  }

  if (action === "CREATE_RESOURCE") {
    const newResourceId = generateNewResourceId(updatedData);
    query = {
      $push: {
        resources: newResourceId,
      },
    };
  } else {
    query = {
      $set: {
        ...updatedData,
      },
    };
  }

  const result = await Model.findOneAndUpdate(
    {
      [key]: id,
      userId,
    },
    query,
    { new: true }
  );

  if (updatedChainedTo) {
    const added = _.difference(updatedChainedTo, chainedTo);
    if (added.length)
      await Model.findOneAndUpdate(
        { _id: added[0], userId },
        { $push: { chainedItems: ObjectId(id) } }
      );

    const removed = _.difference(chainedTo, updatedChainedTo);
    if (removed.length)
      await Model.findOneAndUpdate(
        { _id: removed[0], userId },
        { $pull: { chainedItems: ObjectId(id) } }
      );
  }

  res.send({ result });
};

exports.deletePost = async (req, res, next) => {
  const { id } = req.params;
  const key = getKey(id);
  const { _id: userId } = req.user;

  const result = await Model.findOneAndUpdate(
    {
      [key]: id,
      userId,
    },
    { $set: { deleted: true } }
  );
  res.send({ result });
};

exports.getStats = async (req, res, next) => {
  const { collectionId } = req.query;
  const { _id: userId } = req.user;
  const result = await Model.find({
    visible: true,
    deleted: false,
    collectionId,
    userId,
  }).sort({ createdAt: 1 });

  const stats = {
    total: result.length,
    types: {
      POST: 0,
      DROP: 0,
      QUIZ: 0,
    },
    tags: {
      uncategorized: 0,
    },
    status: {
      DRAFT: 0,
      READY: 0,
      POSTED: 0,
    },
    created: {},
  };

  result.forEach(({ tags = [], type, status, createdAt }) => {
    stats.types[type] = stats.types[type] + 1;
    stats.status[status] = stats.status[status] + 1;

    if (type !== "QUIZ") {
      if (!tags.length)
        stats.tags["uncategorized"] = stats.tags["uncategorized"] + 1;
      else
        tags.forEach((tag) => {
          stats.tags[tag] = stats.tags[tag] ? stats.tags[tag] + 1 : 1;
        });
    }

    const [day, month, year] = moment(createdAt).format("DD-MMM-YY").split("-");
    const createdKey = `${month}-${year}`;
    stats.created[createdKey] = stats.created[createdKey]
      ? stats.created[createdKey] + 1
      : 1;
  });

  res.send({ stats });
};
