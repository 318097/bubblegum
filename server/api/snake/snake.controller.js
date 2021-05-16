// const UserModel = require("../user/user.model");
const SnakeGameModel = require("./snake.model");

exports.storeGameResults = (req, res) => {
  // UserModel.findOne({ _id: req.body.userId }, (err, user) => {
  //   user.snakeGame.highscore = Math.max(user.snakeGame.highscore, req.body.score);
  //   user.snakeGame = Math.max(user.snakeGame, req.body.score);
  //   user.save((err, success) => {
  //     if (err) throw err;
  //   });
  // });
  new SnakeGameModel(req.body)
    .save()
    .then((result) => res.send({ message: "ok" }));
};

exports.getProfile = (req, res) => {
  res.send({ message: "ok" });
};
