const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

const { transparent, protected } = require("../../auth/auth");

router.get("/", transparent, errorHandlingWrapper(controller.getAllPosts));
router.get("/random", errorHandlingWrapper(controller.getRelatedPosts));
router.get("/stats", protected, errorHandlingWrapper(controller.getStats));
router.get("/chains", protected, errorHandlingWrapper(controller.getChains));
router.get(
  "/bookmarks",
  protected,
  errorHandlingWrapper(controller.getBookmarks)
);
router.put(
  "/:id/bookmark",
  protected,
  errorHandlingWrapper(controller.toggleBookmark)
);
router.get("/:id", transparent, errorHandlingWrapper(controller.getPostById));
router.post("/", protected, errorHandlingWrapper(controller.createPost));
router.put("/:id", protected, errorHandlingWrapper(controller.updatePost));
router.delete("/:id", protected, errorHandlingWrapper(controller.deletePost));

module.exports = router;
