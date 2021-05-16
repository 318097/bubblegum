const mongoose = require("mongoose");

const collectionName = "dot-project";
const { ObjectId } = mongoose.Schema.Types;

const DotProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, DotProjectSchema);
