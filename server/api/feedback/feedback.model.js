const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "feedback";

const FeedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: { type: String, required: true },
    userId: { type: ObjectId, ref: "user", required: true },
    source: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, FeedbackSchema);
