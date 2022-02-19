const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "fireboard-task";

const FireboardTodoSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    projectId: { type: ObjectId, ref: "fireboard-project", required: true },
    type: {
      type: String,
      enum: ["TODO", "TOPIC"],
      required: true,
    },
    content: { type: String, required: true },
    marked: { type: Boolean },
    todos: {
      type: Object,
    },
    parentId: {
      type: ObjectId,
      ref: "fireboard-task",
    },
    isDefault: {
      type: Boolean,
    },
    visible: {
      type: Boolean,
    },
    status: {
      completedOn: Date,
      // task
      deadline: Date,
      // topic
      startedOn: Date,
      stoppedOn: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, FireboardTodoSchema);
