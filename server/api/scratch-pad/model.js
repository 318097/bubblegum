const mongoose = require("mongoose");
const schemaName = "scratchPad";

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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, ScratchPadSchema);
