import { Router } from "express";
import * as controller from "./user.controller.js";

const router = Router();

router.put("/settings", controller.updateSettings);
router.put("/app-settings", controller.updateAppSettings);
router.get("/:id", controller.getProfile);

export default router;
