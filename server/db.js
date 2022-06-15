const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./utils/logger");

const connectToDb = async () => {
  // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
  // by default, you need to set it to false.
  // mongoose.set("useFindAndModify", false);

  return mongoose
    .connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.log(`✅ Connected to DB.`))
    .catch((err) => logger.log(`❌ Error in connecting to DB.`, err));
};

module.exports = connectToDb;
