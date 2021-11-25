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
      enum: [
        "LOGGED_IN",
        "REVOKED", // manually revoked tokens
        "LOGGED_OUT",
      ],
      default: "LOGGED_IN",
    },
    authMethod: String,
    loggedInAt: Date,
    loggedOutAt: Date,
  },
  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model(collectionName, SessionSchema);
