const mongoose = require("mongoose");
const schemaName = "feedback";

const FeedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    source: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, FeedbackSchema);
