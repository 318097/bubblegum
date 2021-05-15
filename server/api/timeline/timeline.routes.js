const router = require("express").Router();
const controller = require("./timeline.controller");

const errorHandlingWrapper = require("../../middleware/error-handling");

router.get("/", errorHandlingWrapper(controller.getTimeline));
router.get("/:id", errorHandlingWrapper(controller.gePostById));
router.post("/", errorHandlingWrapper(controller.createPost));
router.put("/:id", errorHandlingWrapper(controller.updatePost));
router.delete("/:id", errorHandlingWrapper(controller.deletePost));

module.exports = router;
