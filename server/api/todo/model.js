const mongoose = require('mongoose');
const schemaName = 'todos';

const TodosSchema = new mongoose.Schema(
  {
    task: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'user' },
    type: {
      type: String,
      default: 'SINGLE_USE',
      enum: [
        'SINGLE_USE',
        'WEEKLY'
      ]
    },
    stamps: {
      type: Array
    },
    frequency: Number,
    active: Boolean
  }, {
    timestamps: true
  }
)

module.exports = mongoose.model(schemaName, TodosSchema);
