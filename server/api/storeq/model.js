const mongoose = require("mongoose");
const schemaName = "storeq";

const StoreqSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Types.ObjectId, ref: "user" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
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

module.exports = mongoose.model(schemaName, StoreqSchema);
