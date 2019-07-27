const mongoose = require('mongoose');
const { Schema } = mongoose;
const schemaName = 'expenses';

const ExpenseSchema = Schema(
  {
    expenseTypeId: mongoose.Types.ObjectId,
    expense: Number,
    message: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(schemaName, ExpenseSchema);
