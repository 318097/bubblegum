const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./fireboard.controller");

router.post("/tasks", errorHandlingWrapper(controller.createTask));
router.get("/tasks", errorHandlingWrapper(controller.getAllTasks));
router.get(
  "/tasks/completed",
  errorHandlingWrapper(controller.getCompletedTasks)
);
router.get("/tasks/:id", errorHandlingWrapper(controller.getTaskById));
router.put("/tasks/:id", errorHandlingWrapper(controller.updateTask));
router.put("/tasks/:id/stamp", errorHandlingWrapper(controller.stampTask));
router.delete("/tasks/:id", errorHandlingWrapper(controller.deleteTask));
router.post("/projects", errorHandlingWrapper(controller.createProject));

module.exports = router;
