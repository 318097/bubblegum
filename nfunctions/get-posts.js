const { connectToDb } = require("./common/db");
const { headers } = require("./common/helpers");

exports.handler = async (event, context) => {
  try {
    const db = await connectToDb();
    const collection = db.collection("posts");

    const {
      search,
      limit = 50,
      page = 1,
      tags = [],
      collectionId,
    } = event.queryStringParameters;

    const aggregation = {
      collectionId,
      deleted: false,
      isAdmin: true,
      status: "POSTED",
      visible: true,
    };

    const sort = {
      _id: -1,
      createdAt: -1,
    };

    if (tags.length)
      aggregation["tags"] = {
        $in: [].concat(tags),
      };

    if (search) {
      const regex = new RegExp(search, "gi");
      aggregation["title"] = {
        $regex: regex,
      };
      aggregation["content"] = {
        $regex: regex,
      };
    }

    const posts = await collection
      .aggregate([
        { $match: aggregation },
        { $sort: sort },
        {
          $skip: (Number(page) - 1) * Number(limit),
        },
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            tags: 1,
            type: 1,
            title: 1,
            content: 1,
            slug: 1,
            solution: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    const count = await collection.find(aggregation).count();

    return {
      statusCode: 200,
      body: JSON.stringify({ posts, meta: { count } }, undefined, 2),
      headers,
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
