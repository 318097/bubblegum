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
    expenseSubTypeId: ObjectId,
    expenseTypeId: { type: ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, ExpenseSchema);
