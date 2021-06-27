const router = require("express").Router();
const config = require("../config");
const errorHandlingWrapper = require("../middleware/error-handling");
const fileStorage = require("../utils/storage");
const {
  protectedRoute,
  externalAccess,
  transparent,
} = require("../utils/authentication");
const userRoutes = require("./user/user.routes");
const taskRoutes = require("./task/task.routes");
const postRoutes = require("./post/post.routes");
const expenseRoutes = require("./expenses/expenses.routes");
const snakeGameRoutes = require("./snake/snake.routes");
const timelineRoutes = require("./timeline/timeline.routes");
const chatRoutes = require("./chat/chat.routes");
const storeqRoutes = require("./storeq/storeq.routes");
const dotRoutes = require("./dot/dot.routes");
const feedbackRoutes = require("./feedback/feedback.routes");
const scratchPadRoutes = require("./scratch-pad/scratch-pad.routes");
const controller = require("./api.controller");

router.get("/test", (req, res) => res.send("Test"));
router.get("/rssfeed", controller.rssFeedParser);
router.post(
  "/upload",
  protectedRoute,
  fileStorage,
  errorHandlingWrapper(controller.fileUploadHandler)
);
router.use("/users", protectedRoute, userRoutes);
router.use("/tasks", protectedRoute, taskRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protectedRoute, expenseRoutes);
router.use("/timeline", protectedRoute, timelineRoutes);
router.use("/dot", externalAccess, dotRoutes);
router.use("/feedback", transparent, feedbackRoutes);
router.use("/scratch-pad", protectedRoute, scratchPadRoutes);

if (config.NODE_ENV !== "express-lambda-production") {
  router.use("/chat", externalAccess, chatRoutes);
  router.use("/storeq", protectedRoute, storeqRoutes);
  router.use("/snake", snakeGameRoutes);
}

if (!config.IS_PROD) {
  router.get("/encrypt-passwords", controller.encryptPasswords);
  router.get("/mongo", controller.mongoDbTest);
}

module.exports = router;
