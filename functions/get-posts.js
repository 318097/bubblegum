const connectToDb = require("../db");
const { headers } = require("./common/helpers");
const PostModel = require("../server/api/post/model");
const { getUserV2 } = require("./common/middlewares");

exports.handler = async (event) => {
  try {
    await connectToDb();

    const user = await getUserV2(event);
    const { _id } = user;

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
      visible: true,
      userId: _id,
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
      aggregation["$or"] = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ];
    }

    const posts = await PostModel.aggregate([
      { $match: aggregation },
      { $sort: sort },
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      { $limit: Number(limit) },
      // {
      //   $project: {
      //     _id: 1,
      //     tags: 1,
      //     type: 1,
      //     status: 1,
      //     title: 1,
      //     content: 1,
      //     slug: 1,
      //     createdAt: 1,
      //     collectionId: 1
      //   },
      // },
    ]);

    const count = await PostModel.find(aggregation).count();

    return {
      statusCode: 200,
      body: JSON.stringify({ posts, meta: { count } }),
      headers,
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 200, body: err.toString(), headers };
  }
};
