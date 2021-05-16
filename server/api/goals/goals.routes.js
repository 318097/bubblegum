const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./goals.controller");

router.get("/", errorHandlingWrapper(controller.getAllGoals));
router.get("/:id", errorHandlingWrapper(controller.getGoalById));
router.post("/", errorHandlingWrapper(controller.createGoal));
router.put("/:id", errorHandlingWrapper(controller.updateGoal));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampGoal));
router.delete("/:id", errorHandlingWrapper(controller.deleteGoal));

module.exports = router;
