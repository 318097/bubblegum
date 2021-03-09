const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const config = require("../../config");

const connectToDb = async () => MongoClient.connect(config.NETLIFY_DB_URL);

const connectToMongoose = async () => {
  return mongoose.connect(config.DB_URL, { useNewUrlParser: true });
  // .then(() => console.log(`Connected to DB...`))
  // .catch((err) => console.log("Error in connecting to MongoDb.", err));
};

module.exports = {
  connectToDb,
  ObjectID,
  connectToMongoose,
};
