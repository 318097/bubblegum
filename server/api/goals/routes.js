const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/", errorHandlingWrapper(controller.getAllGoals));
router.get("/:id", errorHandlingWrapper(controller.getGoalById));
router.post("/", errorHandlingWrapper(controller.createGoal));
router.put("/:id", errorHandlingWrapper(controller.updateGoal));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampGoal));
router.delete("/:id", errorHandlingWrapper(controller.deleteGoal));

module.exports = router;
