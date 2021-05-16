const router = require("express").Router();
const errorHandlingWrapper = require("../middleware/error-handling");
const fileStorage = require("../utils/storage");
const {
  protectedRoute,
  externalAccess,
  transparent,
} = require("../utils/auth");
const userRoutes = require("./user/user.routes");
const todoRoutes = require("./todo/todo.routes");
const postRoutes = require("./post/post.routes");
const expenseRoutes = require("./expenses/expenses.routes");
const snakeGameRoutes = require("./snake/snake.routes");
const timelineRoutes = require("./timeline/timeline.routes");
const chatRoutes = require("./chat/chat.routes");
const goalsRoutes = require("./goals/goals.routes");
const storeqRoutes = require("./storeq/storeq.routes");
const dotRoutes = require("./dot/dot.routes");
const feedbackRoutes = require("./feedback/feedback.routes");
const scratchPadRoutes = require("./scratch-pad/scratch-pad.routes");
const controller = require("./api.controller");

router.get("/test", (req, res) => res.send("Test"));
router.get("/encrypt-passwords", controller.encryptPasswords);
// router.get("/mongo", controller.mongoDbTest);

router.get("/rssfeed", controller.rssFeedParser);
router.post(
  "/upload",
  protectedRoute,
  fileStorage,
  errorHandlingWrapper(controller.fileUploadHandler)
);
router.use("/users", protectedRoute, userRoutes);
router.use("/todos", protectedRoute, todoRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protectedRoute, expenseRoutes);
router.use("/snake", snakeGameRoutes);
router.use("/timeline", protectedRoute, timelineRoutes);
router.use("/chat", externalAccess, chatRoutes);
router.use("/goals", protectedRoute, goalsRoutes);
router.use("/storeq", protectedRoute, storeqRoutes);
router.use("/dot", externalAccess, dotRoutes);
router.use("/feedback", transparent, feedbackRoutes);
router.use("/scratch-pad", protectedRoute, scratchPadRoutes);

module.exports = router;
