const apiRouter = require("express").Router();

const userRoutes = require("../server/api/user/routes");
const todoRoutes = require("../server/api/todo/routes");
const postRoutes = require("../server/api/post/routes");
const expenseRoutes = require("../server/api/expenses/routes");
const timelineRoutes = require("../server/api/timeline/routes");
const goalsRoutes = require("../server/api/goals/routes");
const dotRoutes = require("../server/api/dot/routes");
const feedbackRoutes = require("../server/api/feedback/routes");
const scratchPadRoutes = require("../server/api/scratch-pad/routes");
const authRouter = require("../server/auth/routes");

const controller = require("../server/api/controller");
// const errorHandlingWrapper = require(".../server/api/middleware/errorHandling");

// const fileStorage = require(".../server/api/.../server/api/storage");

const {
  protectedRoute,
  externalAccess,
  transparent,
} = require("../server/utils/auth");

apiRouter.get("/test", (req, res) => res.send("Test"));

apiRouter.get("/rssfeed", controller.rssFeedParser);

// apiRouter.post(
//   "/upload",
//   protectedRoute,
//   fileStorage,
//   errorHandlingWrapper(controller.fileUploadHandler)
// );

apiRouter.use("/users", protectedRoute, userRoutes);
apiRouter.use("/todos", protectedRoute, todoRoutes);
apiRouter.use("/posts", postRoutes);
apiRouter.use("/expenses", protectedRoute, expenseRoutes);
apiRouter.use("/timeline", protectedRoute, timelineRoutes);
apiRouter.use("/goals", protectedRoute, goalsRoutes);
apiRouter.use("/dot", externalAccess, dotRoutes);
apiRouter.use("/feedback", transparent, feedbackRoutes);
apiRouter.use("/scratch-pad", protectedRoute, scratchPadRoutes);
apiRouter.use("/auth", authRouter);

module.exports = apiRouter;
