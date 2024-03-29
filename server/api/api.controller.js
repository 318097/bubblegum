const Parser = require("rss-parser");
const config = require("../config");
const { fileUpload } = require("../utils/file-upload");
const TransactionModel = require("../models/transaction.model");
const sendMail = require("../utils/sendgrid");
const { ACTIVE_PRODUCT_URLS, getProducts } = require("../utils/products");

exports.test = async (req, res) => {
  console.log("host: ", req.get("host"));
  res.send("Working :)");
};

exports.sendgrid = async (req, res) => {
  sendMail({
    email: "mehullakhanpal@gmail.com",
    type: "VERIFY_ACCOUNT",
    name: "ML",
    source: "FIREBOARD",
    token: "abc",
  });
  res.send("Done");
};

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
  console.log("sendEmail:", {
    origin,
    source,
  });
  const validSource = config.IS_PROD
    ? ACTIVE_PRODUCT_URLS.some((host) => host.includes(origin)) ||
      config.ALLOWED_PRODUCT_SOURCES.includes(source)
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
