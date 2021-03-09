const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const config = require("../../config");

const connectToDb = async () => MongoClient.connect(config.NETLIFY_DB_URL);

const connectToMongoose = async () => {
  await mongoose.connect(config.DB_URL, { useNewUrlParser: true });
  // .then(() => logger.log(`Connected to DB...`))
  // .catch((err) => logger.log("Error in connecting to MongoDb.", err));
};

module.exports = {
  connectToDb,
  ObjectID,
  connectToMongoose,
};
