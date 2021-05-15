const Model = require("./timeline.model");

exports.getTimeline = async (req, res, next) => {
  const { page, groupId } = req.query;

  const aggregation = { userId: req.user._id };

  if (groupId) aggregation["groupId"] = groupId;

  const result = await Model.aggregate([
    { $match: aggregation },
    { $sort: { date: -1 } },
  ]);
  res.send({ timeline: result });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.find({ _id: req.params.id });
  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { content, date, groupId } = req.body;

  const result = await Model.create({
    content,
    date,
    groupId,
    userId: req.user._id,
  });
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const PostId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: PostId,
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
  const { id: PostId } = req.params;
  const result = await Model.findOneAndDelete({
    _id: PostId,
  });
  res.send({ result });
};
