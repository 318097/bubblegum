const config = require("../config");
const { fileUpload } = require("../utils/file-upload");
const Parser = require("rss-parser");
const TransactionSchema = require("./model");
const PostsSchema = require("./post/model");

exports.fileUploadHandler = async (req, res) => {
  const result = await fileUpload(req, {
    exactFileName: req.body.storeExactFileName === "TRUE",
  });
  res.send(result);

  if (req.source === "NOTES_APP") {
    const { type, data } = req.body;

    TransactionSchema.create({
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

  let result = await PostsSchema.aggregate([
    { $sort: { _id: 1 } },
    { $project: { _id: 1, resources: 1, title: 1 } },
  ]);
  result = result
    .filter((item) => item.resources.length)
    .map((item) => item._id);
  res.send({ result, count: result.length });
};
