const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SnakeGameSchema = new Schema({}, {strict: false});

module.exports = mongoose.model('snake-game', SnakeGameSchema);