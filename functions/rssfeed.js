const config = require("../config");
const { headers } = require("./common/helpers");
const Parser = require("rss-parser");

const parser = new Parser({});

exports.handler = async (event) => {
  try {
    const feed = await parser.parseURL(config.MEDIUM_RSS_FEED);
    const result = feed.items
      .map(({ title, link, categories, isoDate }) => ({
        title,
        link,
        categories,
        createdAt: isoDate,
      }))
      .slice(0, -1);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 200,
      body: err.message,
      headers,
    };
  }
};
