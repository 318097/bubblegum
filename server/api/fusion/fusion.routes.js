import { Router } from "express";
import errorHandlingWrapper from "../../middleware/error-handling.js";
import { transparent, temporaryAccess } from "../../utils/authentication.js";
import * as controller from "./fusion.controller.js";
import photosRouter from "./photos/photos.routes.js";

const router = Router();

// Alerts routes

router.get(
  "/alerts/feed",
  temporaryAccess,
  errorHandlingWrapper(controller.getAlertsFeed),
);
router.get(
  "/alert-details/:alertId",
  transparent,
  errorHandlingWrapper(controller.getAlertDetailsById),
);
router.post(
  "/alerts/msg",
  transparent,
  errorHandlingWrapper(controller.createAlertMessage),
);

// Lynk routes
router.get(
  "/sh/:path",
  transparent,
  errorHandlingWrapper(controller.resolveShortLink),
);

router.get(
  "/links/:collectionId",
  transparent,
  errorHandlingWrapper(controller.getLynksByCollectionId),
);

router.post(
  "/links/:collectionId",
  transparent,
  errorHandlingWrapper(controller.createOrUpdateLink),
);

router.delete(
  "/links/:collectionId/:linkId",
  transparent,
  errorHandlingWrapper(controller.deleteLink),
);

router.use("/photos", photosRouter);

// Generic entity routes

router.get(
  "/:entityType",
  transparent,
  errorHandlingWrapper(controller.getAllEntities),
);
router.get(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.getEntityById),
);
router.post(
  "/:entityType",
  transparent,
  errorHandlingWrapper(controller.createEntity),
);
router.put(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.updateEntity),
);
router.delete(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.deleteEntity),
);

export default router;
