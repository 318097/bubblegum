const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./user.controller");

router.put("/settings", errorHandlingWrapper(controller.updateSettings));
router.put("/app-settings", errorHandlingWrapper(controller.updateAppSettings));
router.get("/:id", errorHandlingWrapper(controller.getProfile));

module.exports = router;
