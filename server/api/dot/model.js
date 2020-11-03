const mongoose = require("mongoose");
const schemaName = "dot-todos";

const DotSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "dot-topics" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
    marked: { type: Boolean, default: false },
    completedOn: Date,
    projectId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, DotSchema);
