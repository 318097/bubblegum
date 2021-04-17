const mongoose = require("mongoose");
const schemaName = "posts";

const PostsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    index: { type: Number, required: true },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    slug: { type: String, required: true },
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
      default: "DROP",
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
    socialPlatforms: {
      type: Array,
      default: [],
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
    collectionId: { type: String, required: true },
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
    chainedTo: [mongoose.Types.ObjectId], // which all posts is it chained to
    chainedItems: [mongoose.Types.ObjectId], // items linked in a chain
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(schemaName, PostsSchema);
