import mongoose from "mongoose";
import config from "./config.js";
import logger from "./utils/logger.js";

const connectToDb = async () => {
  return mongoose
    .connect(config.DB_URL)
    .then(() => logger.log(`Connected to DB ✅`))
    .catch((err) => logger.error(`Error in connecting to DB ❌`, err));
};

export default connectToDb;
