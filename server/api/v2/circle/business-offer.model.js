import mongoose from "mongoose";
import constants from "../../../constants.js";

const BusinessOfferSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: constants.V2_MODELS.CIRCLE,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    discount: { type: Number, min: 0 },
    discountType: { type: String, enum: ["PERCENT", "FIXED"] },
    startsAt: Date,
    endsAt: Date,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model(
  constants.V2_MODELS.BUSINESS_OFFER,
  BusinessOfferSchema,
);
