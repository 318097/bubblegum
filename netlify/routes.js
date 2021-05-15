const apiRouter = require("express").Router();

const userRoutes = require("../server/api/user/user.routes");
const todoRoutes = require("../server/api/todo/todo.routes");
const postRoutes = require("../server/api/post/post.routes");
const expenseRoutes = require("../server/api/expenses/expenses.routes");
const timelineRoutes = require("../server/api/timeline/timeline.routes");
const goalsRoutes = require("../server/api/goals/goals.routes");
const dotRoutes = require("../server/api/dot/dot.routes");
const feedbackRoutes = require("../server/api/feedback/feedback.routes");
const scratchPadRoutes = require("../server/api/scratch-pad/scratch-pad.routes");
const authRouter = require("../server/auth/auth.routes");

const controller = require("../server/api/api.controller");
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
