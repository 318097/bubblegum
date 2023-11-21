const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");

const { transparent } = require("../../utils/authentication");
const controller = require("./notion.controller");

router.get(
  "/keybindings",
  transparent,
  errorHandlingWrapper(controller.getAllKeyBindings)
);
router.get(
  "/liquid-tech",
  transparent,
  errorHandlingWrapper(controller.getLiquidTech)
);

module.exports = router;
