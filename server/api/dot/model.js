const mongoose = require("mongoose");
const schemaName = "dot";

const DotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    topicId: String,
    content: String,
    marked: { type: Boolean, default: false },
    completedOn: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, DotSchema);
