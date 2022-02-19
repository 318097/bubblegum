const mongoose = require("mongoose");
const { PRODUCT_LIST } = require("../utils/products");

const collectionName = "email-logs";

const EmailLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: PRODUCT_LIST,
      required: true,
    },
    emailType: { type: String, required: true },
    body: Object,
    response: Object,
    error: Object,
  },
  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model(collectionName, EmailLogSchema);
