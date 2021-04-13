const config = require("../../config");
const { fileUpload } = require("../util/file-upload");
const Parser = require("rss-parser");

const parser = new Parser({});

exports.fileUploadHandler = async (req, res) => {
  const result = await fileUpload(req);
  res.send(result);
};

exports.rssFeedParser = async (req, res) => {
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
