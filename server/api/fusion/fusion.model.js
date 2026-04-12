import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const EditablesSchema = new mongoose.Schema(
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
    cols: {
      type: Array,
      default: [],
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
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
    strict: false,
  },
);

const DynamicSchema = new mongoose.Schema(
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
    refreshDuration: {
      type: Number,
      default: 60 * 60 * 8, // 8 hours
    },
    api: {
      type: String,
      required: true,
    },
    apiParams: {
      type: Object,
      default: {},
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
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
    strict: false,
  },
);

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

const LynkCollectionSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    label: {
      type: String,
      unique: true,
      required: true,
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
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
    strict: false,
  },
);

const LynksSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    collectionId: { type: ObjectId, ref: "lynk", required: true },
    slug: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
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
    strict: false,
  },
);

const HabitsSchema = new mongoose.Schema(
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
    targetCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      default: "",
    },
    tracker: {
      type: Object,
      default: {},
    },
    isBubblegumServer: {
      type: Boolean,
      default: true,
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
    strict: false,
  },
);

const AlertAndMsgModel = mongoose.model(
  "alert-and-msges",
  AlertsAndMsgesSchema,
);
const ActivitiesModel = mongoose.model("activities", ActivitiesSchema);
const EditablesModel = mongoose.model("editables", EditablesSchema);
const DynamicModel = mongoose.model("dynamic-ui", DynamicSchema);
const LynkCollectionModel = mongoose.model("lynk", LynkCollectionSchema);
const LynksModel = mongoose.model("links", LynksSchema);
const HabitsModel = mongoose.model("habits", HabitsSchema);

export {
  AlertAndMsgModel,
  ActivitiesModel,
  EditablesModel,
  DynamicModel,
  LynkCollectionModel,
  LynksModel,
  HabitsModel,
};
