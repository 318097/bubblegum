const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const collectionName = "scratchPad";

const ScratchPadSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    userId: {
      type: ObjectId,
      ref: "user",
      required: true,
    },
    expiresOn: {
      type: Date,
    },
    expires: {
      type: Boolean,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    expired: {
      type: Boolean,
      default: false,
    },
    media: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, ScratchPadSchema);
