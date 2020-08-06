const mongoose = require("mongoose");
const schemaName = "posts";

const PostsSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Types.ObjectId, ref: "user" },
    userId: { type: String },
    index: Number,
    title: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    slug: String,
    tags: {
      type: Array,
    },
    tempId: String,
    resources: {
      type: Array,
      default: [],
    },
    type: {
      required: false,
      default: "POST",
      type: String,
      enum: ["POST", "DROP"],
    },
    status: {
      type: String,
      enum: ["DRAFT", "READY", "POSTED"],
      required: true,
      default: "DRAFT",
    },
    socialStatus: {
      type: String,
      enum: ["NONE", "READY", "POSTED"],
      required: true,
      default: "NONE",
    },
    visible: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    fileName: String,
  },
  {
    timestamps: true,
  }
);



module.exports =  mongoose.model(schemaName, PostsSchema),
