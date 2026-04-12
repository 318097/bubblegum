import mongoose from "mongoose";
import {PRODUCT_LIST} from "../utils/products.js";

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
  },
);

export default mongoose.model(collectionName, EmailLogSchema);
