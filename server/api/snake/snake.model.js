const mongoose = require("mongoose");

const SnakeGameSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("snake-game", SnakeGameSchema);
