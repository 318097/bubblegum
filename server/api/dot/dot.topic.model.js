const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "dot-topic";

const DotTopicSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    content: { type: String, required: true },
    projectId: { type: ObjectId, ref: "dot-project", required: true },
    isDefault: { type: Boolean, default: false },
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
