const router = require("express").Router();
const controller = require("./feedback.controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.post("/", errorHandlingWrapper(controller.createFeedback));

module.exports = router;
