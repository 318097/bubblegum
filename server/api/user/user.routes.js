import { Router } from "express";
import errorHandlingWrapper from "../../middleware/error-handling.js";
import * as controller from "./user.controller.js";

const router = Router();

router.put("/settings", errorHandlingWrapper(controller.updateSettings));
router.put("/app-settings", errorHandlingWrapper(controller.updateAppSettings));
router.get("/:id", errorHandlingWrapper(controller.getProfile));

export default router;
