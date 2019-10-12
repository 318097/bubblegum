const Model = require("./model");

const { ObjectId } = require("mongoose").Types;

exports.getAllPosts = async (req, res, next) => {
  const result = await Model.find({});
  res.send({ posts: result });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.find({ _id: req.params.id });
  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { ...post } = req.body;
  console.log(post);
  const result = await Model.create({
    ...post,
    userId: req.user._id
  });
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const { title, content, type } = req.body;
  const postId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: postId
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
  const postId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: postId
  });
  res.send({ result });
};
