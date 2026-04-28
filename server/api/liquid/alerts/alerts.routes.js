import { Router } from "express";
import * as controller from "./alerts.controller.js";

const router = Router();

router.get("/feed", controller.getAlertsFeed);
router.get("/details/:alertId", controller.getAlertDetailsById);
router.post("/msg", controller.createAlertMessage);

export default router;
