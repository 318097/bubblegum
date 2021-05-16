const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./feedback.controller");

router.post("/", errorHandlingWrapper(controller.createFeedback));

module.exports = router;
