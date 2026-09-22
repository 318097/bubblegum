import { Router } from "express";
import { protectedRoute } from "../../utils/authentication.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/google-authentication", controller.authenticateWithGoogle);
router.post("/logout", controller.logout);
router.get("/account-status", protectedRoute, controller.checkAccountStatus);

// Password Management
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/change-password", controller.changePassword);
router.post("/verify-account", controller.verifyAccount);

// E Feed
// Step 1. Generate the URL for the popup
router.get("/generate-google-oauth-url", controller.generateGoogleOAuthURL);
// Step 2. Send the code after confirming with the popup & get the access & refresh token
router.post(
  "/generate-google-oauth-token",
  controller.generateGoogleOAuthToken,
);

export default router;
