import { Router } from "express";
const router = Router();
import errorHandlingWrapper from "../middleware/error-handling.js";
import { protectedRoute } from "../utils/authentication.js";
import * as controller from "./auth.controller.js";

router.post("/login", errorHandlingWrapper(controller.login));
router.post(
  "/google-authentication",
  errorHandlingWrapper(controller.authenticateWithGoogle),
);
router.post("/logout", errorHandlingWrapper(controller.logout));
router.post("/register", errorHandlingWrapper(controller.register));
router.post(
  "/forgot-password",
  errorHandlingWrapper(controller.forgotPassword),
);
router.post("/reset-password", errorHandlingWrapper(controller.resetPassword));
router.post(
  "/change-password",
  errorHandlingWrapper(controller.changePassword),
);
router.post("/verify-account", errorHandlingWrapper(controller.verifyAccount));

// Deprecated this
router.post(
  "/account-status",
  protectedRoute,
  errorHandlingWrapper(controller.checkAccountStatus),
);

router.get(
  "/account-status",
  protectedRoute,
  errorHandlingWrapper(controller.checkAccountStatus),
);

// Step 1. Generate the URL for the popup
router.get(
  "/generate-google-oauth-url",
  errorHandlingWrapper(controller.generateGoogleOAuthURL),
);

// Step 2. Send the code after confirming with the popup & get the access & refresh token
router.post(
  "/generate-google-oauth-token",
  errorHandlingWrapper(controller.generateGoogleOAuthToken),
);

export default router;
