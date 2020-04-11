const { Posts: Model, TagsModel } = require("./model");

exports.getAllPosts = async (req, res, next) => {
  const {
    search,
    limit = 10,
    page = 1,
    tags = [],
    type,
    status,
    socialStatus,
    visible,
  } = req.query;
  const aggregation = {};

  if (tags.length) aggregation["tags"] = { $in: [].concat(tags) };

  if (search) {
    const regex = new RegExp(search, "gi");
    aggregation["title"] = { $regex: regex };
    aggregation["content"] = { $regex: regex };
  }

  if (req.source === "NOTES_APP") {
    if (status && status !== "ALL") aggregation["status"] = status;

    if (socialStatus && socialStatus !== "ALL")
      aggregation["socialStatus"] = socialStatus;

    if (visible) aggregation["visible"] = visible;
  } else {
    aggregation.status = "POSTED";
    aggregation.visible = true;
  }

  const result = await Model.aggregate([
    { $match: aggregation },
    { $sort: { _id: 1, createdAt: -1 } }, // need to sort by _id because when bulk creation is done, all the post have same timestamp and during fetching it results in different sort order if its only sorted by `createdAt`
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);

  const count = await Model.find(aggregation).count();

  res.send({ posts: result, meta: { count } });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.findOne({ _id: req.params.id });

  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { userId, data } = req.body;
  const posts = []
    .concat(data)
    .map((item) => ({ ...item, userId: userId || "admin" }));
  const result = await Model.create(posts);
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: postId,
    },
    {
      $set: {
        ...req.body,
      },
    }
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

exports.getAllTags = async (req, res, next) => {
  const result = await TagsModel.find({});
  res.send({ tags: result });
};

exports.createTag = async (req, res, next) => {
  const { name, color } = req.body;
  const result = await TagsModel.create({ name, color });
  res.send({ tag: result });
};

exports.updateTag = async (req, res, next) => {
  const { id } = req.params;
  const result = await TagsModel.findOneAndUpdate(
    { _id: id },
    { $set: { ...req.body } }
  );
  res.send({ tags: result });
};

exports.deleteTag = async (req, res, next) => {
  const { id } = req.params;
  const result = await TagsModel.findOneAndDelete({ _id: id });
  res.send({ tags: result });
};
