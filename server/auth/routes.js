const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../middleware/errorHandling");
const { protected } = require("./auth");

router.post("/login", errorHandlingWrapper(controller.login));
router.post("/register", errorHandlingWrapper(controller.register));
router.post(
  "/account-status",
  protected,
  errorHandlingWrapper(controller.checkAccountStatus)
);

module.exports = router;
