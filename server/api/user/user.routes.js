const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./user.controller");

router.put("/settings", errorHandlingWrapper(controller.updateSettings));
router.put("/app-settings", errorHandlingWrapper(controller.updateAppSettings));

module.exports = router;
