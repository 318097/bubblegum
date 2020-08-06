const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

const { externalAccess } = require("../../auth/auth");

router.get("/", errorHandlingWrapper(controller.getAllPosts));
router.get("/random", errorHandlingWrapper(controller.getRelatedPosts));
router.get("/:id", errorHandlingWrapper(controller.getPostById));
router.post("/", externalAccess, errorHandlingWrapper(controller.createPost));
router.put("/:id", externalAccess, errorHandlingWrapper(controller.updatePost));
router.delete(
  "/:id",
  externalAccess,
  errorHandlingWrapper(controller.deletePost)
);

module.exports = router;
