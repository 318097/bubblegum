const mongoose = require("mongoose");

const schemaName = "chat";
const { ObjectId } = mongoose.Schema.Types;

const ChatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },
    sender: {
      type: ObjectId,
      required: true
    },
    receiver: {
      type: ObjectId,
      ref: "user"
    },
    delivered: {
      type: Boolean,
      default: false
    },
    messageType: {
      type: String,
      default: "NORMAL",
      enum: ["NORMAL", "CONFESS", "FUTURE"]
    },
    tempId: String,
    metaInfo: Object
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, ChatSchema);
