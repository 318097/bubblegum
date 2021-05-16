const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./todo.controller");

router.get("/", errorHandlingWrapper(controller.getAllTodos));
router.get("/:id", errorHandlingWrapper(controller.getTodoById));
router.post("/", errorHandlingWrapper(controller.createTodo));
router.put("/:id", errorHandlingWrapper(controller.updateTodo));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampTodo));
router.delete("/:id", errorHandlingWrapper(controller.deleteTodo));

module.exports = router;
