const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "feedback";

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: ObjectId, ref: "user" },
    source: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, FeedbackSchema);
