import { Router } from "express";
import { transparent } from "../../../utils/authentication.js";
import * as controller from "./notion.controller.js";

const router = Router();

router.get("/keybindings", transparent, controller.getKeybindings);
router.get("/liquid-tech", transparent, controller.getLiquidTech); // Fetch all the data to render in Code404 website
router.get("/tech-snippets", transparent, controller.getTechSnippets); // Integrated into Pulse chrome extension
router.get("/vocab", transparent, controller.getVocab);

export default router;
