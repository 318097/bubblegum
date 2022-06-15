const router = require("express").Router();
const config = require("../config");
const errorHandlingWrapper = require("../middleware/error-handling");
const fileStorage = require("../utils/storage");
const { protectedRoute, transparent } = require("../utils/authentication");

const userRoutes = require("./user/user.routes");
const postRoutes = require("./post/post.routes");
const snakeGameRoutes = require("./snake/snake.routes");
const storeqRoutes = require("./storeq/storeq.routes");
const fireboardRoutes = require("./fireboard/fireboard.routes");
const feedbackRoutes = require("./feedback/feedback.routes");
const scratchPadRoutes = require("./scratch-pad/scratch-pad.routes");
const migrationRoutes = require("./migration/migration.routes");
const TagsModel = require("../modules/tags/tags.model");
const ModulesModel = require("../modules/modules/modules.model");
const controller = require("./api.controller");
const tagsMiddleware = require("../modules/tags/tags.middleware");

const dynamicRoutes = require("./dynamic-routes/dynamic-routes.routes");

const tagRoutes = dynamicRoutes({
  Model: TagsModel,
  _customMiddleware: tagsMiddleware,
});

const moduleRoutes = dynamicRoutes({
  Model: ModulesModel,
});

// const taskRoutes = require("./task/task.routes");
// const expenseRoutes = require("./expenses/expenses.routes");
// const timelineRoutes = require("./timeline/timeline.routes");
// const chatRoutes = require("./chat/chat.routes");

router.get("/test", controller.test);
router.get("/sendgrid", controller.sendgrid);

router.post("/send-email", errorHandlingWrapper(controller.sendEmail));
router.get("/products", errorHandlingWrapper(controller.getProducts));
router.get("/rssfeed", errorHandlingWrapper(controller.rssFeedParser));
router.post(
  "/upload",
  protectedRoute,
  fileStorage,
  errorHandlingWrapper(controller.fileUploadHandler)
);

router.use("/user", protectedRoute, userRoutes);
router.use("/posts", postRoutes);
router.use("/fireboard", protectedRoute, fireboardRoutes);

router.use("/feedback", transparent, feedbackRoutes);

router.use("/scratch-pad", protectedRoute, scratchPadRoutes);
// router.use("/tasks", protectedRoute, taskRoutes);
// router.use("/expenses", protectedRoute, expenseRoutes);
// router.use("/timeline", protectedRoute, timelineRoutes);

router.use("/migration", migrationRoutes);

router.use("/tags", protectedRoute, tagRoutes);
router.use("/modules", protectedRoute, moduleRoutes);

if (config.NODE_ENV !== "express-lambda-production") {
  // router.use("/chat", externalAccess, chatRoutes);
  router.use("/storeq", protectedRoute, storeqRoutes);
  router.use("/snake", snakeGameRoutes);
}

module.exports = router;
