const router = require("express").Router();
const controller = require("./dot.controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.post("/todos", errorHandlingWrapper(controller.createTodo));
router.get("/todos", errorHandlingWrapper(controller.getAllTodos));
router.get(
  "/todos/completed",
  errorHandlingWrapper(controller.getCompletedTodos)
);
router.get("/todos/:id", errorHandlingWrapper(controller.getTodoById));
router.put("/todos/:id", errorHandlingWrapper(controller.updateTodo));
router.put("/todos/:id/stamp", errorHandlingWrapper(controller.stampTodo));
router.delete("/todos/:id", errorHandlingWrapper(controller.deleteTodo));

router.post("/topics", errorHandlingWrapper(controller.createTopic));
router.put("/topics/:id", errorHandlingWrapper(controller.updateTopic));

router.post("/projects", errorHandlingWrapper(controller.createProject));

module.exports = router;
