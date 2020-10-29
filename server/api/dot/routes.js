const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/completed", errorHandlingWrapper(controller.getCompletedTodos));
router.get("/", errorHandlingWrapper(controller.getAllTodos));
router.get("/:id", errorHandlingWrapper(controller.getTodoById));
router.post("/project", errorHandlingWrapper(controller.createProject));
router.post("/", errorHandlingWrapper(controller.createTodo));
router.put("/:id", errorHandlingWrapper(controller.updateTodo));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampTodo));
router.delete("/:id", errorHandlingWrapper(controller.deleteTodo));

module.exports = router;
