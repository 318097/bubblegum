import mongoose from "mongoose";
import { circleDb } from "../../../db.js";
import constants from "../../../constants.js";

const BusinessFaqSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: constants.V2_MODELS.CIRCLE,
      required: true,
      index: true,
    },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    isCustomerQuery: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default circleDb.model(
  constants.V2_MODELS.BUSINESS_FAQ,
  BusinessFaqSchema,
);
