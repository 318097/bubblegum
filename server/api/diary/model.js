const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiarySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: false
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  createdOn: Schema.Types.Date
});

module.exports = mongoose.model('diary', DiarySchema);
