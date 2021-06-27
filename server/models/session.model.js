const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "session";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "ACTIVE",
    },
    authMethod: String,
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(collectionName, SessionSchema);
