const config = require("../../config");
const { fileUpload } = require("../util/file-upload");
const Parser = require("rss-parser");
const TransactionSchema = require("./model");

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

// db.getCollection("posts")
//   .find({})
//   .forEach((item) => {
//     const newValues = item.resources.map((label) => ({ label }));
//     item.resources = newValues;
//     db.posts.save(item);
//   });
