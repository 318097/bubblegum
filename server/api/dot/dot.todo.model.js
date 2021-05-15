const mongoose = require("mongoose");
const schemaName = "dot-todos";

const DotTodoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "dot-topics" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "dot-projects" },
    marked: { type: Boolean, default: false },
    content: String,
    completedOn: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, DotTodoSchema);
