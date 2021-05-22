const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "dot-todo";

const DotTodoSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    topicId: { type: ObjectId, ref: "dot-topic", required: true },
    projectId: { type: ObjectId, ref: "dot-project", required: true },
    content: { type: String, required: true },
    marked: { type: Boolean, default: false },
    completedOn: Date,
    deadline: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, DotTodoSchema);
