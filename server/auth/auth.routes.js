const router = require("express").Router();
const controller = require("./auth.controller");
const errorHandlingWrapper = require("../middleware/error-handling");
const { protectedRoute, externalAccess } = require("../utils/auth");

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
