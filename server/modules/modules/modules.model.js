import mongoose from "mongoose";
import { PRODUCT_LIST } from "../../utils/products.js";
import constants from "../../constants.js";

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "modules";

const ModulesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: PRODUCT_LIST,
      required: true,
    },
    moduleType: {
      type: String,
      required: true,
      enum: constants.MODULE_TYPES,
    }, // COLLECTION, TIMELINE, etc
    userId: { type: ObjectId, required: true, ref: "user" },
    deleted: { type: Boolean, required: true, default: false },
    visible: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    strict: false,
  },
);

export default mongoose.model(collectionName, ModulesSchema);
