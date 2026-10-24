import { Router } from "express";
import { authV2 } from "../../utils/authentication.js";
import * as controller from "./auth.controller.js";

const { protectedRoute } = authV2;

const router = Router();

router.post("/google-authentication", controller.authenticateWithGoogle);
router.post("/logout", controller.logout);
router.get("/account-status", protectedRoute, controller.checkAccountStatus);

export default router;
