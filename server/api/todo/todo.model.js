const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "todo";

const TodosSchema = new mongoose.Schema(
  {
    task: String,
    userId: { type: ObjectId, ref: "user", required: true },
    type: {
      type: String,
      default: "SINGLE",
      enum: ["SINGLE", "WEEKLY"],
    },
    status: String,
    frequency: Number,
    stamps: Object,
    completionDate: Date,
    active: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, TodosSchema);
