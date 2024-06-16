const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "album";

const AlbumsSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    label: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
    },
    // type: {
    //   required: false,
    //   default: "POST",
    //   type: String,
    //   enum: ["POST", "DROP", "QUIZ", "CHAIN"],
    // },
    // status: {
    //   type: String,
    //   enum: ["QUICK_ADD", "DRAFT", "READY", "POSTED"],
    //   required: true,
    //   default: "DRAFT",
    // },
    visible: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const filesCollectionName = "files";

const FilesSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    albumId: { type: ObjectId, ref: "album", required: true },
    filename: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
    },
    state: {
      type: String,
      enum: ["draft", "live"],
      required: true,
      default: "draft",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    uploadedAt: Date,
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = {
  AlbumModel: mongoose.model(collectionName, AlbumsSchema),
  FilesModel: mongoose.model(filesCollectionName, FilesSchema),
};
