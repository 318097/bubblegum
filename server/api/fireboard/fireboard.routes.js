import { Router } from "express";
const router = Router();
import errorHandlingWrapper from "../../middleware/error-handling.js";
import * as controller from "./fireboard.controller.js";

router.post("/tasks", errorHandlingWrapper(controller.createTask));
router.get("/tasks", errorHandlingWrapper(controller.getAllTasks));
router.get(
  "/tasks/completed",
  errorHandlingWrapper(controller.getCompletedTasks),
);
router.get("/tasks/:id", errorHandlingWrapper(controller.getTaskById));
router.put("/tasks/:id", errorHandlingWrapper(controller.updateTask));
router.put("/tasks/:id/stamp", errorHandlingWrapper(controller.stampTask));
router.delete("/tasks/:id", errorHandlingWrapper(controller.deleteTask));
router.post("/projects", errorHandlingWrapper(controller.createProject));

export default router;
