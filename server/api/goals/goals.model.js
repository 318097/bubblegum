const mongoose = require("mongoose");
const schemaName = "goals";

const GoalsSchema = new mongoose.Schema(
  {
    goal: String,
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    type: {
      type: String,
      default: "DATE",
      enum: ["DATE", "MONTHLY"]
    },
    status: {
      type: String,
      default: "OPEN",
      enum: ["OPEN", "DONE"]
    },
    deadline: Date,
    finishedOn: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, GoalsSchema);
