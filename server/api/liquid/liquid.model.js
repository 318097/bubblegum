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

const EditablesModel = mongoose.model("editables", EditablesSchema);
const DynamicModel = mongoose.model("dynamic-ui", DynamicSchema);

const HabitsModel = mongoose.model("habits", HabitsSchema);

export { EditablesModel, DynamicModel, HabitsModel };
