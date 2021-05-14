const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./util/logger");

const connectToDb = async () => {
  return mongoose
    .connect(config.DB_URL, { useNewUrlParser: true })
    .then(() => logger.log(`Connected to DB.`))
    .catch((err) => logger.log("Error in connecting to MongoDb.", err));
};

module.exports = connectToDb;
