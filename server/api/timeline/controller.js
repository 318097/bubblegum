const Model = require("./model");

const { ObjectId } = require("mongoose").Types;

exports.getTimeline = async (req, res, next) => {
  const result = await Model.aggregate([
    { $match: { userId: req.user._id } },
    { $sort: { date: -1 } }
  ]);
  res.send({ timeline: result });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.find({ _id: req.params.id });
  res.send({ note: result });
};

exports.createPost = async (req, res, next) => {
  const { title, content, type, date } = req.body;

  const result = await Model.create({
    title,
    content,
    type,
    date,
    userId: req.user._id
  });
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const { title, content, type } = req.body;
  const PostId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: PostId
    },
    {
      $set: {
        title,
        content,
        type
      }
    }
  );
  res.send({ result });
};

exports.deletePost = async (req, res, next) => {
  const PostId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: PostId
  });
  res.send({ result });
};
