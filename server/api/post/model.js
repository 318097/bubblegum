const mongoose = require("mongoose");
const schemaName = "posts";

const PostsSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Types.ObjectId, ref: "user" },
    userId: { type: String },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    slug: String,
    tags: {
      type: Array
    },
    tempId: String,
    type: {
      required: false,
      default: "POST",
      type: String,
      enum: ["POST", "DROP"]
    },
    status: {
      type: String,
      enum: ["DRAFT", "READY", "POSTED"],
      required: true,
      default: "DRAFT"
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const TagsSchema = new mongoose.Schema({
  name: String,
  color: String
});

module.exports = {
  Posts: mongoose.model(schemaName, PostsSchema),
  TagsModel: mongoose.model("tags", TagsSchema)
};
