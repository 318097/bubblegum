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

const { protected, externalAccess, transparent } = require("../auth/auth");

router.get("/test", (req, res) => res.send("Test"));

router.use("/users", protected, userRoutes);
router.use("/todos", protected, todoRoutes);
router.use("/posts", postRoutes);
router.use("/expenses", protected, expenseRoutes);
router.use("/snake", snakeGameRoutes);
router.use("/timeline", protected, timelineRoutes);
router.use("/chat", externalAccess, chatRoutes);
router.use("/goals", protected, goalsRoutes);
router.use("/storeq", protected, storeqRoutes);
router.use("/dot", externalAccess, dotRoutes);
router.use("/feedback", transparent, feedbackRoutes);
router.use("/scratch-pad", protected, scratchPadRoutes);

module.exports = router;
