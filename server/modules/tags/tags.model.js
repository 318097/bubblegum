const mongoose = require("mongoose");
const { PRODUCT_LIST } = require("../../utils/products");
const constants = require("../../constants");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "tags";

const TagsSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    source: {
      type: String,
      enum: PRODUCT_LIST,
      required: true,
    },
    moduleId: { type: ObjectId, required: false }, // collectionId, timelineId, etc
    moduleName: {
      type: String,
      required: true,
      enum: constants.TAG_MODULE_NAMES,
    }, // NOTEBASE COLLECTION, TIMELINE, etc
    parentTagId: { type: ObjectId }, // match with 'NestedNode' from Octon
    userId: { type: ObjectId, required: true, ref: "user" },
    deleted: { type: Boolean, required: true, default: false },
    visible: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(collectionName, TagsSchema);
