const router = require("express").Router();
const config = require("../config");
const sendMail = require("../utils/sendgrid");
const errorHandlingWrapper = require("../middleware/error-handling");
const fileStorage = require("../utils/storage");
const {
  protectedRoute,
  // externalAccess,
  transparent,
} = require("../utils/authentication");
const userRoutes = require("./user/user.routes");
// const taskRoutes = require("./task/task.routes");
const postRoutes = require("./post/post.routes");
const expenseRoutes = require("./expenses/expenses.routes");
const snakeGameRoutes = require("./snake/snake.routes");
const timelineRoutes = require("./timeline/timeline.routes");
// const chatRoutes = require("./chat/chat.routes");
const storeqRoutes = require("./storeq/storeq.routes");
const fireboardRoutes = require("./fireboard/fireboard.routes");
const feedbackRoutes = require("./feedback/feedback.routes");
const scratchPadRoutes = require("./scratch-pad/scratch-pad.routes");
const migrationRoutes = require("./migration/migration.routes");

const dynamicRoutes = require("./dynamic-routes/dynamic-routes.routes");

const TagsModel = require("../modules/tags/tags.model");

const controller = require("./api.controller");

router.get("/test", (req, res) => {
  console.log("host: ", req.get("host"));
  res.send("Working :)");
});

router.get("/sendgrid", (req, res) => {
  sendMail({
    email: "mehullakhanpal@gmail.com",
    type: "VERIFY_ACCOUNT",
    name: "ML",
    source: "FIREBOARD",
    token: "abc",
  });
  res.send("Done");
});

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
// router.use("/tasks", protectedRoute, taskRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protectedRoute, expenseRoutes);
router.use("/timeline", protectedRoute, timelineRoutes);
router.use("/fireboard", protectedRoute, fireboardRoutes);
router.use("/feedback", transparent, feedbackRoutes);
router.use("/scratch-pad", protectedRoute, scratchPadRoutes);

// if(config.IS_PROD)
router.use("/migration", migrationRoutes);

router.use("/tags", protectedRoute, dynamicRoutes({ Model: TagsModel }));

if (config.NODE_ENV !== "express-lambda-production") {
  // router.use("/chat", externalAccess, chatRoutes);
  router.use("/storeq", protectedRoute, storeqRoutes);
  router.use("/snake", snakeGameRoutes);
}

module.exports = router;
