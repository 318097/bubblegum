const mongoose = require("mongoose");
const collectionName = "session";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(collectionName, SessionSchema);
