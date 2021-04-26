const router = require("express").Router();

const userRoutes = require("../server/api/user/routes");
const todoRoutes = require("../server/api/todo/routes");
const postRoutes = require("../server/api/post/routes");
const expenseRoutes = require("../server/api/expenses/routes");
const timelineRoutes = require("../server/api/timeline/routes");
const goalsRoutes = require("../server/api/goals/routes");
const dotRoutes = require("../server/api/dot/routes");
const feedbackRoutes = require("../server/api/feedback/routes");
const scratchPadRoutes = require("../server/api/scratch-pad/routes");
// const controller = require("../server/api/controller");
// const errorHandlingWrapper = require(".../server/api/middleware/errorHandling");

// const fileStorage = require(".../server/api/.../server/api/storage");

const {
  protectedRoute,
  externalAccess,
  transparent,
} = require("../server/auth/auth");

router.get("/test", (req, res) => res.send("Test"));

// router.get("/rssfeed", controller.rssFeedParser);

// router.post(
//   "/upload",
//   protectedRoute,
//   fileStorage,
//   errorHandlingWrapper(controller.fileUploadHandler)
// );

router.use("/users", protectedRoute, userRoutes);
router.use("/todos", protectedRoute, todoRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protectedRoute, expenseRoutes);
router.use("/timeline", protectedRoute, timelineRoutes);
router.use("/goals", protectedRoute, goalsRoutes);
router.use("/dot", externalAccess, dotRoutes);
router.use("/feedback", transparent, feedbackRoutes);
router.use("/scratch-pad", protectedRoute, scratchPadRoutes);

module.exports = router;
