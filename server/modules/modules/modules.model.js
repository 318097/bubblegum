const mongoose = require("mongoose");
const { PRODUCT_LIST } = require("../../utils/products");
const constants = require("../../constants");

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
  }
);

module.exports = mongoose.model(collectionName, ModulesSchema);
