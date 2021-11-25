const router = require("express").Router();
const errorHandlingWrapper = require("../middleware/error-handling");
const { protectedRoute } = require("../utils/authentication");
const controller = require("./auth.controller");

router.post("/login", errorHandlingWrapper(controller.login));
router.post("/logout", errorHandlingWrapper(controller.logout));
router.post("/register", errorHandlingWrapper(controller.register));
router.post(
  "/forgot-password",
  errorHandlingWrapper(controller.forgotPassword)
);
router.post("/reset-password", errorHandlingWrapper(controller.resetPassword));
router.post(
  "/change-password",
  errorHandlingWrapper(controller.changePassword)
);
router.post("/verify-account", errorHandlingWrapper(controller.verifyAccount));
router.post(
  "/account-status",
  protectedRoute,
  errorHandlingWrapper(controller.checkAccountStatus)
);

// Step 1. Generate the URL for the popup
router.get(
  "/generate-google-oauth-url",
  errorHandlingWrapper(controller.generateGoogleOAuthURL)
);

// Step 2. Send the code after confirming with the popup & get the access & refresh token
router.post(
  "/generate-google-oauth-token",
  errorHandlingWrapper(controller.generateGoogleOAuthToken)
);

module.exports = router;
