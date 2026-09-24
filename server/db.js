import mongoose from "mongoose";
import config from "./config.js";
import logger from "./utils/logger.js";

// v1 and v2 model files sometimes register a model under a name that's
// already compiled elsewhere (e.g. "user"). Reuse the existing compiled
// model instead of letting mongoose throw OverwriteModelError.
const compileModel = mongoose.model.bind(mongoose);
mongoose.model = (name, schema, ...rest) => {
  if (schema && mongoose.models[name]) return mongoose.models[name];
  return compileModel(name, schema, ...rest);
};

const connectToDb = async () => {
  return mongoose
    .connect(config.DB_URL, { autoIndex: false, autoCreate: false })
    .then(() => logger.system(`Connected to DB`))
    .catch((err) => logger.fatal(`Error in connecting to DB`, err));
};

export default connectToDb;
