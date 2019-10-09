const router = require("express").Router();
const controller = require("./controller");
const asyncMiddleware = require("../middleware/async");

router.post("/login", asyncMiddleware(controller.login));
router.post("/register", asyncMiddleware(controller.register));
router.post("/account-status", asyncMiddleware(controller.checkAccountStatus));

module.exports = router;
