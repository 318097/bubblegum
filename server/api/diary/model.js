const mongoose = require("mongoose");
const schemaName = "diary";

const DiarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, DiarySchema);
