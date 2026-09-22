import mongoose from "mongoose";

const BusinessOfferSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "circle",
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

export default mongoose.model("business-offer", BusinessOfferSchema);
