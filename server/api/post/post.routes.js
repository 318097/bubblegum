const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");

const { transparent, protectedRoute } = require("../../utils/auth");
const controller = require("./post.controller");

router.get("/", transparent, errorHandlingWrapper(controller.getAllPosts));
router.get("/random", errorHandlingWrapper(controller.getRelatedPosts));
router.get("/stats", protectedRoute, errorHandlingWrapper(controller.getStats));
router.get(
  "/chains",
  protectedRoute,
  errorHandlingWrapper(controller.getChains)
);
router.get(
  "/bookmarks",
  protectedRoute,
  errorHandlingWrapper(controller.getBookmarks)
);
router.put(
  "/:id/bookmark",
  protectedRoute,
  errorHandlingWrapper(controller.toggleBookmark)
);
router.get("/:id", transparent, errorHandlingWrapper(controller.getPostById));
router.post("/", protectedRoute, errorHandlingWrapper(controller.createPost));
router.put("/:id", protectedRoute, errorHandlingWrapper(controller.updatePost));
router.delete(
  "/:id",
  protectedRoute,
  errorHandlingWrapper(controller.deletePost)
);

module.exports = router;
