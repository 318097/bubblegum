const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "dot-topic";

const DotTopicSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    projectId: { type: ObjectId, ref: "dot-project", required: true },
    content: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    todos: {
      type: [{ type: ObjectId, ref: "dot-todo" }],
    },
    visible: { type: Boolean, default: true },
    status: {
      startedOn: Date,
      endedOn: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, DotTopicSchema);
