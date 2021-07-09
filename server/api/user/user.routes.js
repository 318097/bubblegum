const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./user.controller");

router.put("/settings", errorHandlingWrapper(controller.updateSettings));

module.exports = router;
