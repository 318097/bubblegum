import { Router } from "express";
import { transparent } from "../../utils/authentication.js";
import * as controller from "./liquid.controller.js";
import photosRouter from "./photos/photos.routes.js";
import linksRouter from "./links/links.routes.js";
import alertRouter from "./alerts/alerts.routes.js";

const router = Router();

// Alerts routes

// Lynk routes
router.get("/sh/:path", controller.resolveShortLink);

router.use("/alerts", transparent, alertRouter);
router.use("/links", transparent, linksRouter);
router.use("/photos", transparent, photosRouter);

// Generic entity routes

router.get("/:entityType", transparent, controller.getAllEntities);
router.get("/:entityType/:entityId", transparent, controller.getEntityById);
router.post("/:entityType", transparent, controller.createEntity);
router.put("/:entityType/:entityId", transparent, controller.updateEntity);
router.delete("/:entityType/:entityId", transparent, controller.deleteEntity);

export default router;
