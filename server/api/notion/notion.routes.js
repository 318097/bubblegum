import { Router } from "express";
import errorHandlingWrapper from "../../middleware/error-handling.js";
import { transparent } from "../../utils/authentication.js";
import * as controller from "./notion.controller.js";

const router = Router();

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
