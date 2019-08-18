const router = require("express").Router();
const controller = require("./controller");

const asyncMiddleware = require("../../middleware/async");

router.get("/", asyncMiddleware(controller.getAllNotes));
router.get("/:id", asyncMiddleware(controller.geNoteById));
router.post("/", asyncMiddleware(controller.createNote));
router.put("/:id", asyncMiddleware(controller.updateNote));
router.delete("/:id", asyncMiddleware(controller.deleteNote));

module.exports = router;
