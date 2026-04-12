import { Router } from "express";
const router = Router();
import errorHandlingWrapper from "../../middleware/error-handling.js";
import { transparent } from "../../utils/authentication.js";
import * as controller from "./notion.controller.js";

router.get(
  "/keybindings",
  transparent,
  errorHandlingWrapper(controller.getAllKeyBindings),
);
router.get(
  "/liquid-tech",
  transparent,
  errorHandlingWrapper(controller.getLiquidTech),
);
router.get("/vocab", transparent, errorHandlingWrapper(controller.getVocab));

export default router;
