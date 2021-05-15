const router = require("express").Router();
const controller = require("./user.controller");
const errorHandlingWrapper = require("../../middleware/error-handling");

// router.get("/", controller.getAll);
router.put("/app-data", errorHandlingWrapper(controller.updateAppData));
router.put("/:id", controller.updateUser);
router.post("/", controller.createUser);
// router.delete("/:id", controller.deleteUser);
router.get("/:id/settings", errorHandlingWrapper(controller.getSettings));
router.put("/:id/settings", errorHandlingWrapper(controller.updateSettings));

module.exports = router;
