const router = require("express").Router();
const controller = require("./scratch-pad.controller");
const fileStorage = require("../../utils/storage");

const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/", errorHandlingWrapper(controller.getAllItems));
router.get("/:id", errorHandlingWrapper(controller.geItemById));
router.post("/", fileStorage, errorHandlingWrapper(controller.createItem));
router.put("/:id", errorHandlingWrapper(controller.updateItem));
router.delete("/:id", errorHandlingWrapper(controller.deleteItem));

module.exports = router;
