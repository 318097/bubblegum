import mongoose from "mongoose";
import constants from "../../../constants.js";

const BusinessPostSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: constants.V2_MODELS.CIRCLE,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    slug: { type: String, trim: true },
    tags: { type: [String], default: [] },
    media: { type: [mongoose.Schema.Types.Mixed], default: [] },
    publishedAt: Date,
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model(
  constants.V2_MODELS.BUSINESS_POST,
  BusinessPostSchema,
);
