import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

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
  },
);

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
      enum: ["draft", "published", "archived", "deleted", "private"],
      required: true,
      default: "draft",
    },
    pinned: {
      type: Boolean,
      default: false,
    },

    uploadedAt: Date,
  },
  {
    timestamps: true,
    strict: false,
  },
);

const AlbumModel = mongoose.model("album", AlbumsSchema);
const FilesModel = mongoose.model("files", FilesSchema);

export { AlbumModel, FilesModel };
