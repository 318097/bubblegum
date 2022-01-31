const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");
const UserModel = require("../user/user.model");
const {
  getKey,
  generateResourceName,
  generateSlug,
  isSearchId,
  processId,
} = require("../../utils/common");
const Model = require("./post.model");

const { ObjectId } = mongoose.Types;

const getAggregationFilters = (req) => {
  const {
    search,
    limit = 25,
    page = 1,
    tags = [],
    status = [],
    socialStatus,
    visible,
    collectionId,
    sortOrder,
    sortFilter,
    rating,
    type,
    deleted,
  } = req.query;

  const aggregation = {
    collectionId: processId(collectionId),
    deleted: deleted === "true",
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

  if (status.length)
    aggregation["status"] = {
      $in: [].concat(status),
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

  if (["NOTEBASE", "FLASH"].includes(req.source)) {
    aggregation["userId"] = req.userId;

    if (rating) aggregation["rating"] = Number(rating);
    if (type) aggregation["type"] = type;
    if (socialStatus) aggregation["socialStatus"] = socialStatus;
    if (visible) aggregation["visible"] = visible === "true";
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

  return { aggregation, sort, page, limit };
};

exports.getRelatedPosts = async (req, res) => {
  const { collectionId, tags = [], postId } = req.query;
  const aggregation = {
    status: "POSTED",
    visible: true,
    isAdmin: true,
    deleted: false,
    collectionId: processId(collectionId),
    _id: { $ne: ObjectId(postId) },
  };
  if (tags.length) aggregation["tags"] = { $in: tags };

  const posts = await Model.aggregate([
    {
      $match: aggregation,
    },
    { $sample: { size: 4 } },
  ]);
  res.send({ posts });
};

exports.getChains = async (req, res) => {
  const { userId } = req;
  const { collectionId } = req.query;
  const chains = await Model.aggregate([
    {
      $match: {
        type: "CHAIN",
        collectionId: processId(collectionId),
        userId,
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ]);
  res.send({ chains });
};

exports.getAllPosts = async (req, res) => {
  const { aggregation, sort, page, limit } = getAggregationFilters(req);
  console.log("aggregation, sort::-", aggregation, sort);

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

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const { collectionId } = req.query;
  const key = getKey(id);
  const aggregation = {
    [key]: key === "_id" ? ObjectId(id) : id,
    collectionId: processId(collectionId),
  };

  if (req.source === "NOTEBASE") {
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

exports.createPost = async (req, res) => {
  const { data, sourceInfo = {} } = req.body;
  const { collectionId } = req.query;
  const { _id, userType, notebase = [] } = req.user;
  const currentCollection = _.find(notebase, { _id: processId(collectionId) });

  if (!currentCollection) throw new Error("Cannot find collection.");

  let index = _.get(currentCollection, "index", 1);

  const batchSourceInfo =
    data.length > 1
      ? {
          batchId: new Date().getTime(),
          batchSize: data.length,
          startIndex: index,
          endIndex: Number(index) + data.length - 1,
        }
      : {};

  const mergedSourceInfo = {
    ...sourceInfo,
    ...batchSourceInfo,
    source: req.source,
  };

  const posts = [].concat(data).map((item) => {
    const slug = item.slug ? item.slug : generateSlug({ title: item.title });
    const postIndex = Number(index);
    index++;

    // const resourceId = generateResourceName({ slug, index: postIndex });
    return {
      ...item,
      userId: _id,
      isAdmin: userType === "ADMIN",
      index: postIndex,
      collectionId: processId(collectionId),
      slug,
      resources: [],
      sourceInfo: { ...mergedSourceInfo, ...item.sourceInfo },
    };
  });

  const result = await Model.create(posts);

  await UserModel.findOneAndUpdate(
    { _id, "notebase._id": processId(collectionId) },
    { $set: { [`notebase.$.index`]: index } }
  );

  res.send({ result });
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const key = getKey(id);
  const { action, collectionId } = req.query;
  const { status, liveId, chainedTo, updatedChainedTo } = req.body;
  const { user } = req;
  const { _id: userId } = user;
  let query;
  const updatedData = {
    ...req.body,
  };

  if (updatedChainedTo) updatedData["chainedTo"] = updatedChainedTo;

  if (!liveId && status === "POSTED") {
    const collectionLiveId = _.get(
      _.find(user.notebase, { _id: processId(collectionId) }, {}),
      "liveId",
      0
    );
    updatedData["liveId"] = collectionLiveId;
    updatedData["publishedAt"] = moment().toISOString();

    await UserModel.findOneAndUpdate(
      { _id: userId, "notebase._id": processId(collectionId) },
      { $set: { [`notebase.$.liveId`]: collectionLiveId + 1 } }
    );
  }

  if (["CREATE_RESOURCE", "CREATE_FILENAME"].includes(action)) {
    const key = action === "CREATE_RESOURCE" ? "resources" : "fileNames";
    const id = generateResourceName({ ...updatedData, action });
    query = {
      $addToSet: {
        [key]: {
          // ..._.get(body, "resourceData", {}),
          label: id,
        },
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
        { $addToSet: { chainedItems: id } }
      );

    const removed = _.difference(chainedTo, updatedChainedTo);
    if (removed.length)
      await Model.findOneAndUpdate(
        { _id: removed[0], userId },
        { $pull: { chainedItems: id } }
      );
  }

  res.send({ result });
};

exports.deletePost = async (req, res) => {
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

exports.getStats = async (req, res) => {
  const { aggregation } = getAggregationFilters(req);
  const result = await Model.find(aggregation).sort({ createdAt: 1 });

  const stats = {
    total: result.length,
    types: {
      DROP: 0,
      POST: 0,
      QUIZ: 0,
      CHAIN: 0,
    },
    tags: {
      uncategorized: 0,
    },
    status: {
      QUICK_ADD: 0,
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

exports.getBookmarks = async (req, res) => {
  const { aggregation } = getAggregationFilters(req);
  const result = await Model.aggregate([
    {
      $match: {
        ...aggregation,
        _id: { $in: _.get(req, "user.bookmarkedPosts", []) },
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "chainedItems",
        foreignField: "_id",
        as: "chainedPosts",
      },
    },
  ]);

  res.send({
    bookmarks: result,
  });
};

exports.toggleBookmark = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const updatedData = {
    [status ? "$addToSet" : "$pull"]: {
      bookmarkedPosts: ObjectId(id),
    },
  };
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    updatedData
  );

  res.send({
    result,
  });
};
