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
    marked: { type: Boolean, default: false },
    todos: {
      type: Object,
      default: [],
      validator: function () {
        return this.type === "TOPIC";
      },
    },
    parentId: {
      type: ObjectId,
      ref: "fireboard-task",
      validator: function () {
        return this.type === "TODO";
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
      validator: function () {
        return this.type === "TOPIC";
      },
    },
    visible: {
      type: Boolean,
      default: true,
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
