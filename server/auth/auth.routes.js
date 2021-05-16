const router = require("express").Router();
const errorHandlingWrapper = require("../middleware/error-handling");
const { protectedRoute, externalAccess } = require("../utils/auth");
const controller = require("./auth.controller");

router.post("/login", errorHandlingWrapper(controller.login));
router.post("/register", errorHandlingWrapper(controller.register));
router.post(
  "/forgot-password",
  errorHandlingWrapper(controller.forgotPassword)
);
router.post("/reset-password", errorHandlingWrapper(controller.resetPassword));
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
