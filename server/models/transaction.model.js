const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "transaction";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(collectionName, TransactionSchema);
