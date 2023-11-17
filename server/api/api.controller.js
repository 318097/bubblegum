const Parser = require("rss-parser");
const config = require("../config");
const { fileUpload } = require("../utils/file-upload");
const TransactionModel = require("../models/transaction.model");
const sendMail = require("../utils/sendgrid");
const { ACTIVE_PRODUCT_URLS, getProducts } = require("../utils/products");
const _ = require("lodash");
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: config.NOTION_AUTH_KEY,
});

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

exports.getNotionData = async (req, res) => {
  try {
    const { dbId } = req.query;
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Live",
        checkbox: {
          equals: true,
        },
      },
    });

    const results = [];
    response.results.map((item) => {
      const { properties } = item;
      const result = {};
      _.forEach(properties, (value, key) => {
        const { type } = value;
        let finalValue = "";
        switch (type) {
          case "multi_select":
            finalValue = value.multi_select.map((item) => item.name);
            break;
          case "title":
            finalValue = _.get(value, "title.0.plain_text");
            break;
          case "rich_text":
            finalValue = _.get(value, "rich_text.0.plain_text");
            break;
          case "select":
            finalValue = _.get(value, "select.name");
            break;
          case "checkbox":
            finalValue = _.get(value, "checkbox");
            break;
          case "number":
            finalValue = _.get(value, "number");
            break;
          // default:
          //   throw new Error("Unhandled notion type.");
        }
        result[key] = finalValue;
      });
      results.push(result);
    });

    res.send({ data: results });
  } catch (err) {
    console.log(err);
  }
};
