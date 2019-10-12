const mongoose = require("mongoose");
const schemaName = "posts";

const PostsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tags: {
      type: Array
    },
    type: {
      required: true,
      type: String,
      enum: ["POST", "DROP"]
    },
    status: String,
    // should it be displayed
    active: {
      type: Boolean,
      default: false
    },
    // live on the site or not
    posted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, PostsSchema);
