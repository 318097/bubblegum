const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "todo";

const TodosSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    userId: { type: ObjectId, ref: "user", required: true },
    type: {
      type: String,
      required: true,
      enum: ["TODO", "GOAL", "PROGRESS"],
    },
    status: {
      type: String,
      default: "INIT",
      enum: ["INIT", "IN_PROGRESS", "COMPLETED"],
    },
    frequency: Number,
    stamps: Object,
    deadline: Date,
    completedOn: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, TodosSchema);
