import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const CircleSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
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
    businessType: {
      type: String,
      enum: [
        "restaurant",
        "cafe",
        "retail",
        "salon",
        "spa",
        "clinic",
        "gym",
        "service",
        "hotel",
        "other",
      ],
      default: "other",
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
    socialLinks: {
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    logo: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
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
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    workingHours: {
      monday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      tuesday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      wednesday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      thursday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      friday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      saturday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
      sunday: {
        opening: { type: String, default: "" },
        closing: { type: String, default: "" },
      },
    },
    currentStatus: {
      type: String,
      enum: ["open", "closed", "busy", "unknown", "unavailable"],
      default: "unknown",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const CircleModel = mongoose.model("circle", CircleSchema);

export { CircleModel };
