const mongoose = require("mongoose");
const schemaName = "storeq";

const StoreqSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Types.ObjectId, ref: "user" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      enum: ["INITIATE", "WATING", "ACTIVE", "COMPLETE", "CANCELLED"],
      default: "INITIATE",
    },
    completedOn: Date,
    active: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, StoreqSchema);
