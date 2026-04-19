import { Router } from "express";
import errorHandlingWrapper from "../../../middleware/error-handling.js";
import * as controller from "./alerts.controller.js";

const router = Router();

router.get("/feed", errorHandlingWrapper(controller.getAlertsFeed));
router.get(
  "/details/:alertId",
  errorHandlingWrapper(controller.getAlertDetailsById),
);
router.post("/msg", errorHandlingWrapper(controller.createAlertMessage));

export default router;
