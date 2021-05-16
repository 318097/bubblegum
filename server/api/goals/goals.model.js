const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "goal";

const GoalsSchema = new mongoose.Schema(
  {
    goal: String,
    userId: { type: ObjectId, ref: "user", required: true },
    type: {
      type: String,
      default: "DATE",
      enum: ["DATE", "MONTHLY"],
    },
    status: {
      type: String,
      default: "OPEN",
      enum: ["OPEN", "DONE"],
    },
    deadline: Date,
    finishedOn: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, GoalsSchema);
