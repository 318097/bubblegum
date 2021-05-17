const router = require("express").Router();
const errorHandlingWrapper = require("../middleware/error-handling");
const { protectedRoute } = require("../utils/authentication");
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

module.exports = router;
