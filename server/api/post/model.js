const mongoose = require("mongoose");
const schemaName = "posts";

const PostsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    title: String,
    content: String,
    type: {
      type: String
    },
    status: String,
    active: Boolean
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, PostsSchema);
