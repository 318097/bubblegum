const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const collectionName = "dot-todo";

const DotTodoSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user" },
    topicId: { type: ObjectId, ref: "dot-topic" },
    projectId: { type: ObjectId, ref: "dot-project" },
    marked: { type: Boolean, default: false },
    content: String,
    completedOn: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, DotTodoSchema);
