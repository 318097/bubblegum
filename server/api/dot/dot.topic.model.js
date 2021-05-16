const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const collectionName = "dot-topic";

const DotTopicSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user" },
    content: String,
    projectId: { type: ObjectId, ref: "dot-project" },
    isDefault: Boolean,
    todos: {
      type: Array,
    },
    visible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, DotTopicSchema);
