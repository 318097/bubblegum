const router = require("express").Router();

const userRoutes = require("./user/routes");
const todoRoutes = require("./todo/routes");
const postRoutes = require("./post/routes");
const expenseRoutes = require("./expenses/routes");
const snakeGameRoutes = require("./snake/routes");
const timelineRoutes = require("./timeline/routes");
const chatRoutes = require("./chat/routes");
const goalsRoutes = require("./goals/routes");
const storeqRoutes = require("./storeq/routes");
const dotRoutes = require("./dot/routes");
const feedbackRoutes = require("./feedback/routes");
const scratchPadRoutes = require("./scratch-pad/routes");
const controller = require("./controller");
const errorHandlingWrapper = require("../middleware/errorHandling");

const fileStorage = require("../../storage");

const { protectedRoute, externalAccess, transparent } = require("../auth/auth");

router.get("/test", (req, res) => res.send("Test"));

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
