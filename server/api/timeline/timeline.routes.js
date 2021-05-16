const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./timeline.controller");


router.get("/", errorHandlingWrapper(controller.getTimeline));
router.get("/:id", errorHandlingWrapper(controller.gePostById));
router.post("/", errorHandlingWrapper(controller.createPost));
router.put("/:id", errorHandlingWrapper(controller.updatePost));
router.delete("/:id", errorHandlingWrapper(controller.deletePost));

module.exports = router;
