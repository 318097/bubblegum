import mongoose from "mongoose";
import { circleDb } from "../../../db.js";
import constants from "../../../constants.js";
import { PRODUCT_LIST } from "../../../utils/products.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      enum: PRODUCT_LIST,
      required: true,
    },
    // settings: Object,
    uid: {
      // Google UID
      type: String,
      default: "",
      required: false,
    },
    photoURL: {
      // Google Photo URL
      type: String,
      default: "",
      required: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      required: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
      required: false,
    },
    radiusKm: {
      type: Number,
      default: 10,
      required: false,
    },
    location: {
      // browser location object & geocode (reverse geocoding)
      type: Object,
      default: {},
      required: false,
    },
    geoCoordinates: {
      // mongodb geospatial coordinates (longitude, latitude)
      type: Object,
      default: {},
      required: false,
    },
    locationLabel: {
      type: String,
      default: "",
      required: false,
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

UserSchema.index({ geoCoordinates: "2dsphere" });

export default circleDb.model(constants.V2_MODELS.USER, UserSchema);
