const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;
const collectionName = "expense";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true },
    amount: Number,
    date: Date,
    message: String,
    expenseSubTypeId: ObjectId,
    expenseTypeId: ObjectId,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(collectionName, ExpenseSchema);
