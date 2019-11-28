const router = require("express").Router();
const controller = require("./controller");

const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/", errorHandlingWrapper(controller.getAllNotes));
router.get("/:id", errorHandlingWrapper(controller.geNoteById));
router.post("/", errorHandlingWrapper(controller.createNote));
router.put("/:id", errorHandlingWrapper(controller.updateNote));
router.delete("/:id", errorHandlingWrapper(controller.deleteNote));

module.exports = router;
