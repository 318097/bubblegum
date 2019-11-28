const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../middleware/errorHandling");

router.post("/login", errorHandlingWrapper(controller.login));
router.post("/register", errorHandlingWrapper(controller.register));
router.post("/account-status", errorHandlingWrapper(controller.checkAccountStatus));

module.exports = router;
