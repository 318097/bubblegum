import { Router } from "express";
import userRoutes from "./user/user.routes.js";
import * as controller from "./api.controller.js";
import { authV2 } from "../../utils/authentication.js";
import photosRouter from "./photos/photos.routes.js";
import linksRouter from "./links/links.routes.js";
import alertRouter from "./alerts/alerts.routes.js";
import circleRouter from "./circle/circle.routes.js";

const { transparent, protectedRoute } = authV2;

const router = Router();

router.get("/test", controller.test);
router.get("/error", controller.testError);

router.use("/user", protectedRoute, userRoutes);

// Alerts routes

// Lynk routes
router.get("/sh/:path", controller.resolveShortLink);

router.use("/alerts", transparent, alertRouter);
router.use("/circle", protectedRoute, circleRouter);
router.use("/links", transparent, linksRouter);
router.use("/photos", transparent, photosRouter);

// Generic entity routes

router.get("/:entityType", transparent, controller.getAllEntities);
router.get("/:entityType/:entityId", transparent, controller.getEntityById);
router.post("/:entityType", transparent, controller.createEntity);
router.put("/:entityType/:entityId", transparent, controller.updateEntity);
router.delete("/:entityType/:entityId", transparent, controller.deleteEntity);

export default router;
