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
const { AlbumModel, FilesModel } = require("./photos.model");

const { ObjectId } = mongoose.Types;

const getAggregationFilters = (req) => {
  const {
    search,
    limit = 250,
    page = 1,
    tags = [],
    status = [],
    visible,
    sortOrder,
    sortFilter,
    type,
    deleted,
  } = req.query;
  const { albumId } = req.params;
  const aggregation = {
    albumId: processId(albumId),
  };
  // need to sort by _id because when bulk creation is done, all the post have same timestamp and during fetching it results in different sort order if its only sorted by `createdAt`
  let sort = {
    _id: -1,
    createdAt: -1,
  };

  // if (tags.length)
  //   aggregation["tags"] = {
  //     $in: [].concat(tags),
  //   };

  // if (status.length)
  //   aggregation["status"] = {
  //     $in: [].concat(status),
  //   };

  // if (search) {
  //   const searchTypeIsId = isSearchId(search);
  //   if (searchTypeIsId) {
  //     const key = status === "POSTED" ? "liveId" : "index";
  //     aggregation[key] = Number(search.trim());
  //   } else {
  //     const regex = new RegExp(search, "gi");
  //     aggregation["$or"] = [
  //       {
  //         title: {
  //           $regex: regex,
  //         },
  //       },
  //       {
  //         content: {
  //           $regex: regex,
  //         },
  //       },
  //     ];
  //   }
  // }

  // sort = {
  //   [sortFilter]: sortOrder === "ASC" ? 1 : -1,
  // };

  return { aggregation, sort, page, limit };
};

exports.getRelatedPosts = async (req, res) => {
  const { collectionId, tags = [], postId, size = 6 } = req.query;
  const aggregation = {
    status: "POSTED",
    visible: true,
    isAdmin: true,
    deleted: false,
    collectionId: processId(collectionId),
    _id: { $ne: ObjectId(postId) },
  };
  if (tags.length) aggregation["tags"] = { $in: tags };

  const posts = await AlbumModel.aggregate([
    {
      $match: aggregation,
    },
    { $sample: { size: Number(size) } },
  ]);
  res.send({ posts });
};

exports.getChains = async (req, res) => {
  const { userId } = req;
  const { collectionId } = req.query;
  const chains = await AlbumModel.aggregate([
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

exports.getAllPhotosByAlbum = async (req, res) => {
  const { aggregation, sort, page, limit } = getAggregationFilters(req);

  const photos = await FilesModel.aggregate([
    { $match: aggregation },
    { $sort: sort },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    { $limit: Number(limit) },
  ]);

  const count = await FilesModel.find(aggregation).count();

  res.send({
    photos,
    meta: { count },
  });
};

exports.getAllAlbums = async (req, res) => {
  // const { aggregation } = getAggregationFilters(req);

  const albums = await AlbumModel.find({});

  res.send({
    albums,
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

  const [result] = await AlbumModel.aggregate([
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

exports.addFilesToAlbum = async (req, res) => {
  const { data } = req.body;
  const { albumId } = req.params;
  const { _id } = req.user;

  const files = [].concat(data).map((file) => {
    return {
      ...file,
      userId: _id,
      albumId,
      uploadedAt: new Date().getTime(),
      // sourceInfo: file.sourceInfo,
    };
  });
  const result = await FilesModel.create(files);

  res.send({ result });
};

exports.createAlbum = async (req, res) => {
  const { _id } = req.user;
  const { label } = req.body;
  console.log("req.body::-", req.body);

  const album = {
    userId: _id,
    label,
  };
  const result = await AlbumModel.create(album);

  res.send({ result });
};

exports.updateFilesInAlbum = async (req, res) => {
  const { userId } = req;
  const { fileIds = [], action } = req.body;
  const { albumId } = req.params;

  const updatedData = {};

  if (action) {
    switch (action) {
      case "draft":
      case "published":
        updatedData["state"] = action;
        updatedData["deleted"] = false;
        updatedData["archived"] = false;
        break;
      case "archived":
        updatedData["archived"] = true;
        updatedData["deleted"] = false;
        break;
      case "deleted":
        updatedData["deleted"] = true;
        updatedData["archived"] = false;
        break;
      case "private":
        break;
    }
  }

  const query = {
    _id: { $in: fileIds.map((id) => processId(id)) },
    albumId,
    // userId,
  };

  const result = await FilesModel.updateMany(
    query,
    { $set: updatedData },
    {
      new: true,
    }
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

  const result = await AlbumModel.findOneAndUpdate(
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
      await AlbumModel.findOneAndUpdate(
        { _id: added[0], userId },
        { $addToSet: { chainedItems: id } }
      );

    const removed = _.difference(chainedTo, updatedChainedTo);
    if (removed.length)
      await AlbumModel.findOneAndUpdate(
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

  const result = await AlbumModel.findOneAndUpdate(
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
  const result = await AlbumModel.find(aggregation).sort({ createdAt: 1 });

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
  const result = await AlbumModel.aggregate([
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
