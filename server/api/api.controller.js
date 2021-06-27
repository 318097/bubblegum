const Parser = require("rss-parser");
const bcrypt = require("bcrypt");
const config = require("../config");
const { fileUpload } = require("../utils/file-upload");
const { processId } = require("../helpers");
const TransactionModel = require("../models/transaction.model");
const PostModel = require("./post/post.model");
const UserModel = require("./user/user.model");

exports.fileUploadHandler = async (req, res) => {
  const result = await fileUpload(req, {
    exactFileName: req.body.storeExactFileName === "TRUE",
  });
  res.send(result);

  if (req.source === "NOTES_APP") {
    const { type, data } = req.body;

    TransactionModel.create({
      userId: req.user._id,
      source: req.source,
      type, // one of ['DROP', 'POST', 'TOBY', 'CHROME', 'RESOURCES']
      fileName: result.map((item) => item.original_filename),
      files: result,
      data, // extra info for reference
    });
  }
};

exports.rssFeedParser = async (req, res) => {
  const parser = new Parser({});
  const feed = await parser.parseURL(config.MEDIUM_RSS_FEED);
  const result = feed.items
    .map(({ title, link, categories, isoDate }) => ({
      title,
      link,
      categories,
      createdAt: isoDate,
    }))
    .slice(0, -1);
  res.send(result);
};

exports.mongoDbTest = async (req, res) => {
  // const updateResources = () => {
  //   db.getCollection("posts")
  //     .find({})
  //     .forEach((item) => {
  //       const newValues = item.resources
  //         ? item.resources.map((label) => ({ label }))
  //         : [];
  //       item.resources = newValues;
  //       db.posts.save(item);
  //     });
  // }

  let result = await PostModel.aggregate([
    { $sort: { _id: 1 } },
    { $project: { _id: 1, resources: 1, title: 1 } },
  ]);
  result = result
    .filter((item) => item.resources.length)
    .map((item) => item._id);
  res.send({ result, count: result.length });
};

exports.encryptPasswords = async (req, res) => {
  const users = await UserModel.find({});

  users.forEach(async (item) => {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(item.password, salt);
    console.log(password);

    await UserModel.updateOne(
      { _id: processId(item._id) },
      { $set: { password, originalPassword: item.password } }
    );
  });

  res.send("ok");
};
