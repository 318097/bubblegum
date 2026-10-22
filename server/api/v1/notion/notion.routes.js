import { Router } from "express";
import { transparent } from "../../../utils/authentication.js";
import * as controller from "./notion.controller.js";

const router = Router();

// Code404 routes
router.get("/liquid-tech", transparent, controller.getLiquidTech); // Fetch entire db to render in Code404 website

// Pulse extension routes
router.get("/vocab", transparent, controller.getVocab);
router.get("/tech-snippets", transparent, controller.getTechSnippets); // Integrated into Pulse chrome extension
router.get("/keybindings", transparent, controller.getKeybindings);

export default router;
