import { Router } from "express";
import { transparent, protectedRoute } from "../../utils/authentication.js";
import * as controller from "./post.controller.js";

const router = Router();

router.get("/", transparent, controller.getAllPosts);
router.get("/post-ids", transparent, controller.getAllPostIds);
router.get("/random", controller.getRelatedPosts);
router.get("/stats", protectedRoute, controller.getStats);
router.get("/chains", protectedRoute, controller.getChains);
router.get("/bookmarks", protectedRoute, controller.getBookmarks);
router.put("/", protectedRoute, controller.bulkUpdate);
router.put("/:id/bookmark", protectedRoute, controller.toggleBookmark);
router.get("/:id", transparent, controller.getPostById);
router.post("/", protectedRoute, controller.createPost);
router.put("/:id", protectedRoute, controller.updatePost);
router.delete("/:id", protectedRoute, controller.deletePost);

export default router;
