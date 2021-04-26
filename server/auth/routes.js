const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../middleware/errorHandling");
const { protectedRoute, externalAccess } = require("./auth");

router.post("/login", errorHandlingWrapper(controller.login));
router.post("/register", errorHandlingWrapper(controller.register));
router.post(
  "/account-status",
  protectedRoute,
  errorHandlingWrapper(controller.checkAccountStatus)
);
router.get(
  "/account-status",
  externalAccess,
  errorHandlingWrapper(controller.checkAccountStatus)
);

module.exports = router;
