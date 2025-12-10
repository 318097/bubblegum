const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");

const { transparent, temporaryAccess } = require("../../utils/authentication");
const controller = require("./fusion.controller");

// Alerts routes

router.get(
  "/alerts/feed",
  temporaryAccess,
  errorHandlingWrapper(controller.getAlertsFeed)
);
router.get(
  "/alert-details/:alertId",
  transparent,
  errorHandlingWrapper(controller.getAlertDetailsById)
);
router.post(
  "/alerts/msg",
  transparent,
  errorHandlingWrapper(controller.createAlertMessage)
);

// Generic entity routes

router.get(
  "/:entityType",
  transparent,
  errorHandlingWrapper(controller.getAllEntities)
);
router.get(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.getEntityById)
);
router.post(
  "/:entityType",
  transparent,
  errorHandlingWrapper(controller.createEntity)
);
router.put(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.updateEntity)
);
router.delete(
  "/:entityType/:entityId",
  transparent,
  errorHandlingWrapper(controller.deleteEntity)
);

module.exports = router;
