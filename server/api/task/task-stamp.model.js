const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "task-stamp";

const TaskStampSchema = new mongoose.Schema(
  {
    message: { type: String, required: false },
    date: { type: Date, required: true },
    userId: { type: ObjectId, ref: "user", required: true },
    taskId: { type: ObjectId, ref: "task", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, TaskStampSchema);
