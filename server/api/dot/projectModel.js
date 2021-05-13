const mongoose = require("mongoose");
const schemaName = "dot-projects";

const DotProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, DotProjectSchema);
