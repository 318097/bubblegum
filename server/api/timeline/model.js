const mongoose = require("mongoose");
const schemaName = "timeline";

const TimelineSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: false
    },
    date: {
      type: Date,
      required: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, TimelineSchema);
