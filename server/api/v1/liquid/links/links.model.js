import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const LynkCollectionSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    label: {
      type: String,
      unique: true,
      required: true,
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
    },
    archived: {
      type: Boolean,
      default: false,
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

const LynksSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    collectionId: { type: ObjectId, ref: "lynk", required: true },
    slug: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
    },
    archived: {
      type: Boolean,
      default: false,
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

const LynkCollectionModel = mongoose.model("lynk", LynkCollectionSchema);
const LynksModel = mongoose.model("links", LynksSchema);

export { LynkCollectionModel, LynksModel };
