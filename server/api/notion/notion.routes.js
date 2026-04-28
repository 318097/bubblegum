import { Router } from "express";
import { transparent } from "../../utils/authentication.js";
import * as controller from "./notion.controller.js";

const router = Router();

router.get("/keybindings", transparent, controller.getAllKeyBindings);
router.get("/liquid-tech", transparent, controller.getLiquidTech);
router.get("/vocab", transparent, controller.getVocab);

export default router;
