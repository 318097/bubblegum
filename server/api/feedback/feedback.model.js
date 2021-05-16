const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const collectionName = "feedback";

const FeedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    userId: { type: ObjectId, ref: "user" },
    source: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, FeedbackSchema);
