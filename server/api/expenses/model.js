const mongoose = require('mongoose');
const schemaName = 'expenses';

const ExpenseSchema = new mongoose.Schema(
  {
    expenseTypeId: mongoose.Types.ObjectId,
    amount: Number,
    message: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, ExpenseSchema);
