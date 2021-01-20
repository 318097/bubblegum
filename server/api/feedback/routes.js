const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.post("/", errorHandlingWrapper(controller.createFeedback));

module.exports = router;
