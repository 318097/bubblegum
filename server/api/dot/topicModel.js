const mongoose = require("mongoose");
const schemaName = "dot-topics";

const DotTopicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
    projectId: String,
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

module.exports = mongoose.model(schemaName, DotTopicSchema);
