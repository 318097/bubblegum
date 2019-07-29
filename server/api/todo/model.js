const mongoose = require('mongoose');
const schemaName = 'todos';

const TodosSchema = new mongoose.Schema(
  {
    task: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'user' },
    type: {
      type: String,
      default: 'SINGLE',
      enum: [
        'SINGLE',
        'WEEKLY'
      ]
    },
    stamps: Object,
    frequency: Number,
    active: Boolean
  }, {
    timestamps: true
  }
)

module.exports = mongoose.model(schemaName, TodosSchema);
