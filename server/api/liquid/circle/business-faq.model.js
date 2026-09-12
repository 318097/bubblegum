import mongoose from "mongoose";

const BusinessFaqSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "circle",
      required: true,
      index: true,
    },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("business-faq", BusinessFaqSchema);
