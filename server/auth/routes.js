const router = require("express").Router();
const controller = require("./controller");
const asyncMiddleware = require("../middleware/async");

router.post("/login", asyncMiddleware(controller.login));
router.post("/register", asyncMiddleware(controller.register));

module.exports = router;
