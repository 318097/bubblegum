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
      enum: ["POST", "DROP", "QUIZ", "CHAIN"],
    },
    status: {
      type: String,
      enum: ["QUICK_ADD", "DRAFT", "READY", "POSTED"],
      required: true,
      default: "DRAFT",
    },
    socialStatus: {
      type: String,
      enum: ["NONE", "READY", "POSTED"],
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
    collectionId: String, // collection id to which the note belongs
    liveId: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    solution: String,
    url: String,
    rating: {
      type: Number,
      default: 0,
    },
    publishedAt: Date,
    notes: {
      type: Array,
      default: [],
    },
    chainedTo: [],
    chainedItems: [],
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(schemaName, PostsSchema);
