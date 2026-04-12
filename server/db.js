const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./utils/logger");

const connectToDb = async () => {
  return mongoose
    .connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.log(`Connected to DB ✅`))
    .catch((err) => logger.error(`Error in connecting to DB ❌`, err));
};

module.exports = connectToDb;
