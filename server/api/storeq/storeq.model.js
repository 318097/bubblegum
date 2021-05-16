const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "storeq";

const StoreqSchema = new mongoose.Schema(
  {
    storeId: { type: ObjectId, ref: "user" },
    userId: { type: ObjectId, ref: "user" },
    status: {
      type: String,
      enum: [
        "INITIATE",
        "ACTIVE",
        "WAITING",
        "COMPLETE",
        "CANCELLED",
        "SKIPPED",
      ],
      default: "INITIATE",
    },
    completedOn: Date,
    waitingNo: Number,
    initialWaitingNo: Number,
    ttf: Number,
    startedOn: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, StoreqSchema);
