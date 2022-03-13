const Parser = require("rss-parser");
const config = require("../config");
const { fileUpload } = require("../utils/file-upload");
const TransactionModel = require("../models/transaction.model");
const sendMail = require("../utils/sendgrid");
const { ORIGIN_LIST, getProducts } = require("../utils/products");

exports.fileUploadHandler = async (req, res) => {
  const result = await fileUpload(req, {
    exactFileName: req.body.storeExactFileName === "TRUE",
  });
  res.send(result);

  if (req.source === "NOTEBASE") {
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

exports.sendEmail = async (req, res) => {
  const { email, name, source, type = "WELCOME" } = req.body;
  const origin = req.get("host");
  console.log("origin", origin);
  const validSource = config.IS_PROD
    ? ORIGIN_LIST.some((host) => host.includes(origin))
    : true;

  if (!validSource) throw new Error("INVALID_SOURCE");
  if (!email || !source) throw new Error("INVALID_EMAIL_PARAMETERS");

  await sendMail({
    name,
    email,
    type,
    source,
  });

  res.send("ok");
};

exports.getProducts = async (req, res) => {
  const products = getProducts();
  res.send({ products });
};
