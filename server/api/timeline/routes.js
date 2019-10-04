const router = require("express").Router();
const controller = require("./controller");

const asyncMiddleware = require("../../middleware/async");

router.get("/", asyncMiddleware(controller.getTimeline));
router.get("/:id", asyncMiddleware(controller.gePostById));
router.post("/", asyncMiddleware(controller.createPost));
router.put("/:id", asyncMiddleware(controller.updatePost));
router.delete("/:id", asyncMiddleware(controller.deletePost));

module.exports = router;
