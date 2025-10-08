const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");

const { transparent } = require("../../utils/authentication");
const controller = require("./fusion.controller");

// router.get("/feed", transparent, errorHandlingWrapper(controller.getFeed));
router.get("/", transparent, errorHandlingWrapper(controller.getAllEntities));
router.get(
  "/:entityId",
  transparent,
  errorHandlingWrapper(controller.getEntityById)
);
router.post("/", transparent, errorHandlingWrapper(controller.createEntity));
router.put(
  "/:entityId",
  transparent,
  errorHandlingWrapper(controller.updateEntity)
);
router.delete(
  "/:entityId",
  transparent,
  errorHandlingWrapper(controller.deleteEntity)
);

router.get(
  "/alert/:alertId",
  transparent,
  errorHandlingWrapper(controller.getAlertDetailsById)
);
router.post(
  "/alert/msg",
  transparent,
  errorHandlingWrapper(controller.createAlertMessage)
);

module.exports = router;
