import { Router } from "express";
import { protectedRoute } from "../../utils/authentication.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/google-authentication", controller.authenticateWithGoogle);
router.post("/logout", controller.logout);
router.get("/account-status", protectedRoute, controller.checkAccountStatus);

export default router;
