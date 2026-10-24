import mongoose from "mongoose";
import { circleDb } from "../../../db.js";
import constants from "../../../constants.js";

const { ObjectId } = mongoose.Schema.Types;

const OpeningRangeSchema = new mongoose.Schema(
  { open: String, close: String },
  { _id: false },
);

const CircleSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: constants.V2_MODELS.USER, required: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    links: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      x: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      formattedAddress: { type: String, default: "" },
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point",
    //   },
    //   coordinates: {
    //     type: [Number],
    //     default: [0, 0],
    //   },
    // },
    // logo: {
    //   type: String,
    //   default: "",
    // },
    // coverImage: {
    //   type: String,
    //   default: "",
    // },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    // later
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Per day, one or more { open, close } "HH:mm" ranges (split shifts);
    // an empty array means closed. Matches circle's DEFAULT_OPENING_HOURS.
    hours: {
      monday: { type: [OpeningRangeSchema], default: undefined },
      tuesday: { type: [OpeningRangeSchema], default: undefined },
      wednesday: { type: [OpeningRangeSchema], default: undefined },
      thursday: { type: [OpeningRangeSchema], default: undefined },
      friday: { type: [OpeningRangeSchema], default: undefined },
      saturday: { type: [OpeningRangeSchema], default: undefined },
      sunday: { type: [OpeningRangeSchema], default: undefined },
    },
    status: {
      type: String,
      // enum: ["open", "closed", "busy", "unknown", "unavailable"],
      default: "unknown",
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const CircleModel = circleDb.model(constants.V2_MODELS.CIRCLE, CircleSchema);

export { CircleModel };
