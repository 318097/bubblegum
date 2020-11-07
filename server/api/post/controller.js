const _ = require("lodash");
const moment = require("moment");
const Model = require("./model");
const UserModel = require("../user/model");
const { getKey, generateNewResourceId, generateSlug } = require("./utils");

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
    visibility,
    collectionId,
    sortOrder,
    sortFilter,
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

  if (req.source === "NOTES_APP") {
    // const { _id } = req.user;
    // aggregation["userId"] = _id;

    if (status && status !== "ALL") aggregation["status"] = status;

    if (socialStatus && socialStatus !== "ALL")
      aggregation["socialStatus"] = socialStatus;

    if (visibility && visibility !== "ALL")
      aggregation["visible"] = visibility === "visible";

    if (sortFilter) {
      sort = {
        [sortFilter]: sortOrder === "ASC" ? 1 : -1,
      };
    }
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
  const key = getKey(id);
  const result = await Model.findOne({ [key]: id });

  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { data } = req.body;
  const { collectionId } = req.query;
  const { _id, userType } = req.user;
  const currentCollection = _.get(req, ["user", "notesApp", collectionId], {});
  let index = _.get(currentCollection, "index", 1);

  const posts = [].concat(data).map((item) => ({
    ...item,
    userId: _id,
    isAdmin: userType === "ADMIN",
    index: index++,
    collectionId,
    slug: generateSlug({ title: item.title }),
    resources: [],
  }));

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
  const { status, liveId } = req.body;
  const { user } = req;
  let query;
  const updatedData = {
    ...req.body,
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
      { _id: _.get(req, "user._id") },
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
    },
    query,
    { new: true }
  );

  res.send({ result });
};

exports.deletePost = async (req, res, next) => {
  const { id } = req.params;
  const key = getKey(id);

  const result = await Model.findOneAndUpdate(
    {
      [key]: id,
    },
    { $set: { deleted: true } }
  );
  res.send({ result });
};

exports.getStats = async (req, res, next) => {
  const { collectionId } = req.query;
  const result = await Model.find({
    visible: true,
    deleted: false,
    collectionId,
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
