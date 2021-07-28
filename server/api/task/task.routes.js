const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./task.controller");

router.get("/", errorHandlingWrapper(controller.getAllTasks));
router.get("/:id", errorHandlingWrapper(controller.getTaskById));
router.post("/", errorHandlingWrapper(controller.createTask));
router.put("/:id", errorHandlingWrapper(controller.updateTask));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampTask));
router.delete("/:id", errorHandlingWrapper(controller.deleteTask));

module.exports = router;
