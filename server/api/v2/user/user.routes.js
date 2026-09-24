import { Router } from "express";
import * as controller from "./user.controller.js";

const router = Router();

router.put("/settings", controller.updateProfile);
router.get("/:id", controller.getProfile);

export default router;
