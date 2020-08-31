const functions = require("firebase-functions");
const MongoClient = require("mongodb").MongoClient;

const config = {
  DB: functions.config().database.uri,
};

const connectToDb = async () => await MongoClient.connect(config.DB);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

exports.getPosts = functions.https.onRequest(async (request, response) => {
  try {
    const db = await connectToDb();
    const collection = db.collection("posts");

    const {
      search,
      limit = 10,
      page = 1,
      tags = [],
      collectionId,
    } = request.query;

    const aggregation = {
      // collectionId,
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

    response.send(JSON.stringify({ posts, meta: { count } }, undefined, 2));
  } catch (err) {
    console.log(err);
    response.send("error");
  }
});

exports.getPostById = functions.https.onRequest(async (request, response) => {
  try {
    const db = await connectToDb();
    const collection = db.collection("posts");
    const id = request.params["0"];
    // console.log(request.params, request.query);
    const post = await collection.find({ _id: id }).toArray();

    response.send(JSON.stringify({ post }, undefined, 2));
  } catch (err) {
    console.log(err);
    response.send("error");
  }
});

exports.getRandomPosts = functions.https.onRequest(
  async (request, response) => {
    try {
      const db = await connectToDb();
      const collection = db.collection("posts");

      const posts = await collection
        .aggregate([
          { $match: { status: "POSTED", visible: true } },
          { $sample: { size: 5 } },
        ])
        .toArray();

      response.send(JSON.stringify({ posts }, undefined, 2));
    } catch (err) {
      console.log(err);
      response.send("error");
    }
  }
);
