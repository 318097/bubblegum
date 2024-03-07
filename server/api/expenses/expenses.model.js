const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "expense";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    message: String,
    favorite: { type: Boolean, default: false },
    excluded: { type: Boolean, default: false },
    expenseTypeId: { type: ObjectId, required: true },
    expenseSubTypeId: ObjectId,
    expenseSourceId: { type: String },
    expenseGroupId: { type: ObjectId },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, ExpenseSchema);
