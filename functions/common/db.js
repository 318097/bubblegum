const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const config = require("../../config");

const connectToDb = async () => MongoClient.connect(config.NETLIFY_DB_URL);

module.exports = {
  connectToDb,
  ObjectID,
};
