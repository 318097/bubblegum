import mongoose from "mongoose";
import { circleDb } from "../db.js";

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
  },
);

// Same schema in both databases: v1 sessions live in bubblegum, v2 sessions in circle
const SessionModel = mongoose.model(collectionName, SessionSchema);
const SessionModelV2 = circleDb.model(collectionName, SessionSchema);

export { SessionModelV2 };
export default SessionModel;
