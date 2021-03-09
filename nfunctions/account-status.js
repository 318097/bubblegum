const _ = require("lodash");
const { connectToDb, ObjectID } = require("./common/db");
const { generateSlug, headers } = require("./common/helpers");
const { getUser } = require("./common/middlewares");

exports.handler = async (event, context) => {
  try {
    const db = await connectToDb();
    const matchQuery = {};

    return {
      statusCode: 200,
      body: "ok",
      headers,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 200,
      body: "Error",
      headers,
    };
  }
};
