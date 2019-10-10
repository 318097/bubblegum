const mongoose = require("mongoose");
const schemaName = "expenses";

const ExpenseSchema = new mongoose.Schema(
  {
    date: Date,
    expenseTypeId: mongoose.Types.ObjectId,
    amount: Number,
    message: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    expenseGroup: {
      type: String,
      enum: ["PERSONAL", "HOME"],
      default: "PERSONAL"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, ExpenseSchema);
