const mongoose = require("mongoose");
const schemaName = "storeq";

const StoreqSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Types.ObjectId, ref: "user" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      enum: ["INITIATE", "WAITING", "ACTIVE", "COMPLETE", "CANCELLED"],
      default: "INITIATE",
    },
    completedOn: Date,
    active: Boolean,
    waitingNo: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, StoreqSchema);
