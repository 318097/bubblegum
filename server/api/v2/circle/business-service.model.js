import mongoose from "mongoose";
import { circleDb } from "../../../db.js";
import constants from "../../../constants.js";

const BusinessServiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: constants.V2_MODELS.CIRCLE,
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

export default circleDb.model(
  constants.V2_MODELS.BUSINESS_SERVICE,
  BusinessServiceSchema,
);
