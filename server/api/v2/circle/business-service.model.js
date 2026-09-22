import mongoose from "mongoose";

const BusinessServiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "circle",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, min: 0 },
    currency: { type: String, default: "USD", trim: true },
    durationMinutes: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("business-service", BusinessServiceSchema);
