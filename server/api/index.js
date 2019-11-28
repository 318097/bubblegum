const router = require("express").Router();

const userRoutes = require("./user/routes");
const todoRoutes = require("./todo/routes");
const postRoutes = require("./post/routes");
const expenseRoutes = require("./expenses/routes");
const diaryRoutes = require("./diary/routes");
const snakeGameRoutes = require("./snake/routes");
const timelineRoutes = require("./timeline/routes");

const { protected } = require("../auth/auth");

router.get("/test", (req, res) => res.send("Test"));

router.use("/users", userRoutes);
router.use("/todos", protected, todoRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protected, expenseRoutes);
router.use("/diary", protected, diaryRoutes);
router.use("/snake", snakeGameRoutes);
router.use("/timeline", protected, timelineRoutes);

module.exports = router;
