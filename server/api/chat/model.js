const mongoose = require("mongoose");
const schemaName = "chat";

const ChatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    messageType: {
      type: String,
      default: 'NORMAL',
      enum: [
        'NORMAL',
        'CONFESS',
        'FUTURE'
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, ChatSchema);
