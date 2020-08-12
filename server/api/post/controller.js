const _ = require("lodash");
const Model = require("./model");
const UserModel = require("../user/model");

exports.getRelatedPosts = async (req, res, next) => {
  const { tags = [] } = req.params;
  const posts = await Model.aggregate([
    { $match: { status: "POSTED", visible: true } },
    { $sample: { size: 5 } },
  ]);
  res.send({ posts });
};

exports.getAllPosts = async (req, res, next) => {
  const {
    search,
    limit = 10,
    page = 1,
    tags = [],
    status,
    socialStatus,
    visible,
    collectionId,
    sortOrder,
    sortFilter,
  } = req.query;
  const aggregation = {
    collectionId,
  };
  // need to sort by _id because when bulk creation is done, all the post have same timestamp and during fetching it results in different sort order if its only sorted by `createdAt`
  let sort = {
    _id: 1,
    createdAt: -1,
  };

  if (tags.length)
    aggregation["tags"] = {
      $in: [].concat(tags),
    };

  if (search) {
    const regex = new RegExp(search, "gi");
    aggregation["title"] = {
      $regex: regex,
    };
    aggregation["content"] = {
      $regex: regex,
    };
  }

  if (req.source === "NOTES_APP") {
    if (status && status !== "ALL") aggregation["status"] = status;

    if (socialStatus && socialStatus !== "ALL")
      aggregation["socialStatus"] = socialStatus;

    if (visible) aggregation["visible"] = visible;

    if (sortFilter) {
      sort = {
        [sortFilter]: sortOrder === "ASC" ? 1 : -1,
      };
    }
  } else {
    aggregation.status = "POSTED";
    aggregation.visible = true;
  }

  const result = await Model.aggregate([
    { $match: aggregation },
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
  const result = await Model.findOne({ _id: req.params.id });

  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { data } = req.body;
  const { collectionId } = req.query;
  const { _id, userType } = req.user;
  const currentCollection = _.get(req, ["user.notesApp", collectionId], {});
  let index = _.get(currentCollection, "index", 1);

  const posts = [].concat(data).map((item) => ({
    ...item,
    userId: _id,
    isAdmin: userType === "ADMIN",
    index: index++,
    collectionId,
  }));
  const result = await Model.create(posts);
  await UserModel.findOneAndUpdate(
    { _id: _.get(req, "user._id") },
    { $set: { [`notesApp.${collectionId}.index`]: index } }
  );
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.id;
  const { action, value, collectionId } = req.query;
  const { status } = req.body;
  const { user } = req;
  let query;
  const updatedData = {
    ...req.body,
  };

  if (status === "POSTED") {
    const collectionLiveIndex = _.get(
      user,
      ["notesApp", collectionId, "liveId"],
      0
    );
    updatedData["liveId"] = collectionLiveIndex;
    await UserModel.findOneAndUpdate(
      { _id: _.get(req, "user._id") },
      { $set: { [`notesApp.${collectionId}.liveId`]: collectionLiveIndex + 1 } }
    );
  }

  if (action === "CREATE_RESOURCE") {
    query = {
      $push: {
        resources: value,
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
      _id: postId,
    },
    query,
    { new: true }
  );

  res.send({ result });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: postId,
  });
  res.send({ result });
};
