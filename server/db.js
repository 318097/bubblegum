import mongoose from "mongoose";
import config from "./config.js";
import logger from "./utils/logger.js";

// Set globally rather than as `connect` options so `circleDb` inherits them too
// (`useDb` copies the parent connection's config when it's created, i.e. before
// `connect` runs).
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

const connectToDb = async () => {
  return mongoose
    .connect(config.DB_URL)
    .then(() => logger.system(`Connected to DB`))
    .catch((err) => logger.fatal(`Error in connecting to DB`, err));
};

// Models registered with `mongoose.model` go to the default (bubblegum) database.
// v2 models register on `circleDb` instead: same cluster and connection pool,
// different database. It opens when `connectToDb` does.
const circleDb = mongoose.connection.useDb(config.CIRCLE_DB_NAME, {
  useCache: true,
});

export { circleDb };
export default connectToDb;
