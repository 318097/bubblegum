import mongoose from "mongoose";
import { circleDb } from "../../../db.js";
import constants from "../../../constants.js";

const { ObjectId } = mongoose.Schema.Types;

const AlbumsSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: constants.V2_MODELS.USER, required: true },
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
    userId: { type: ObjectId, ref: constants.V2_MODELS.USER, required: true },
    albumId: { type: ObjectId, ref: constants.V2_MODELS.ALBUM, required: true },
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

const AlbumModel = circleDb.model(constants.V2_MODELS.ALBUM, AlbumsSchema);
const FilesModel = circleDb.model(constants.V2_MODELS.FILES, FilesSchema);

export { AlbumModel, FilesModel };
