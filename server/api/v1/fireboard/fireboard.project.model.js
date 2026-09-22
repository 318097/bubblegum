import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "fireboard-project";

const FireboardProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(collectionName, FireboardProjectSchema);
