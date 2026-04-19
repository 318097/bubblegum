import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const AlertsAndMsgesSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    label: {
      type: String,
      // required: true,
    },
    activities: {
      type: Array,
      default: [],
    },
    days: {
      type: Array,
      default: [],
    },
    slots: {
      type: Array,
      default: [],
    },
    radius: {
      type: String,
      default: "1000",
    },
    msg: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
    },
    type: {
      required: false,
      default: "ALERT",
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const ActivitiesSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    label: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // required: true,
    },
    activities: {
      type: Array,
      default: [],
    },
    date: {
      type: String,
      default: "",
    },
    day: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      default: "",
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
    },
    type: {
      required: false,
      default: "ACTIVITY",
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const AlertAndMsgModel = mongoose.model(
  "alert-and-msges",
  AlertsAndMsgesSchema,
);
const ActivitiesModel = mongoose.model("activities", ActivitiesSchema);

export { AlertAndMsgModel, ActivitiesModel };
