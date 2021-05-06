const mongoose = require("mongoose");
const schemaName = "expenses";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    amount: Number,
    date: Date,
    message: String,
    expenseTypeId: mongoose.Types.ObjectId,
    expenseGroup: mongoose.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(schemaName, ExpenseSchema);
