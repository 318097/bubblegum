import { Router } from "express";
import * as controller from "./fireboard.controller.js";

const router = Router();

router.post("/tasks", controller.createTask);
router.get("/tasks", controller.getAllTasks);
router.get("/tasks/completed", controller.getCompletedTasks);
router.get("/tasks/:id", controller.getTaskById);
router.put("/tasks/:id", controller.updateTask);
router.put("/tasks/:id/stamp", controller.stampTask);
router.delete("/tasks/:id", controller.deleteTask);
router.post("/projects", controller.createProject);

export default router;
