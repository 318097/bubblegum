const router = require("express").Router();
const controller = require("./snake.controller");

router.post("/game-results", controller.storeGameResults);
router.get("/profile/:userId", controller.getProfile);

module.exports = router;
