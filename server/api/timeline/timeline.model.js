const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "timeline";

const TimelineSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    groupId: {
      type: Array,
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, TimelineSchema);
