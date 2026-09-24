import mongoose from "mongoose";
import constants from "../../../constants.js";

const { ObjectId } = mongoose.Schema.Types;

const LynkCollectionSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: constants.V2_MODELS.USER, required: true },
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
    userId: { type: ObjectId, ref: constants.V2_MODELS.USER, required: true },
    collectionId: {
      type: ObjectId,
      ref: constants.V2_MODELS.LYNK_COLLECTION,
      required: true,
    },
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

const LynkCollectionModel = mongoose.model(
  constants.V2_MODELS.LYNK_COLLECTION,
  LynkCollectionSchema,
);
const LynksModel = mongoose.model(constants.V2_MODELS.LYNKS, LynksSchema);

export { LynkCollectionModel, LynksModel };
