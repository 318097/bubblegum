const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "fireboard-project";

const FireboardProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, FireboardProjectSchema);
