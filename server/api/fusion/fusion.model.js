const mongoose = require("mongoose");

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
    time: {
      type: Array,
      default: [],
    },
    isAlert: {
      type: Boolean, // true for alert, false for message
      default: true,
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
      // enum: ["POST", "DROP", "QUIZ", "CHAIN"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
      default: "ACTIVE",
    },
    visible: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
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
    activity: {
      type: String,
      default: "",
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
    visible: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = {
  AlertAndMsgModel: mongoose.model("alert-and-msges", AlertsAndMsgesSchema),
  ActivitiesModel: mongoose.model("activities", ActivitiesSchema),
};
