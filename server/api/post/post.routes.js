import { Router } from "express";
const router = Router();
import errorHandlingWrapper from "../../middleware/error-handling.js";
import { transparent, protectedRoute } from "../../utils/authentication.js";
import * as controller from "./post.controller.js";

router.get("/", transparent, errorHandlingWrapper(controller.getAllPosts));
router.get(
  "/post-ids",
  transparent,
  errorHandlingWrapper(controller.getAllPostIds),
);
router.get("/random", errorHandlingWrapper(controller.getRelatedPosts));
router.get("/stats", protectedRoute, errorHandlingWrapper(controller.getStats));
router.get(
  "/chains",
  protectedRoute,
  errorHandlingWrapper(controller.getChains),
);
router.get(
  "/bookmarks",
  protectedRoute,
  errorHandlingWrapper(controller.getBookmarks),
);
router.put("/", protectedRoute, errorHandlingWrapper(controller.bulkUpdate));
router.put(
  "/:id/bookmark",
  protectedRoute,
  errorHandlingWrapper(controller.toggleBookmark),
);
router.get("/:id", transparent, errorHandlingWrapper(controller.getPostById));
router.post("/", protectedRoute, errorHandlingWrapper(controller.createPost));
router.put("/:id", protectedRoute, errorHandlingWrapper(controller.updatePost));
router.delete(
  "/:id",
  protectedRoute,
  errorHandlingWrapper(controller.deletePost),
);

export default router;
