import { Router } from "express";
import errorHandlingWrapper from "../../middleware/error-handling.js";
import { temporaryAccess } from "../../utils/authentication.js";
import * as controller from "./photos.controller.js";

const router = Router();

router.get("/", errorHandlingWrapper(controller.getAllAlbums));
router.get(
  "/:albumId",
  // temporaryAccess,
  errorHandlingWrapper(controller.getAllPhotosByAlbum),
);
router.post("/", temporaryAccess, errorHandlingWrapper(controller.createAlbum));
router.post(
  "/files/:albumId",
  temporaryAccess,
  errorHandlingWrapper(controller.addFilesToAlbum),
);
router.put(
  "/:albumId",
  temporaryAccess,
  errorHandlingWrapper(controller.updateFilesInAlbum),
);

// router.get("/random", errorHandlingWrapper(controller.getRelatedPosts));
// router.get("/stats", temporaryAccess, errorHandlingWrapper(controller.getStats));
// router.get(
//   "/chains",
//   temporaryAccess,
//   errorHandlingWrapper(controller.getChains)
// );
// router.get(
//   "/bookmarks",
//   temporaryAccess,
//   errorHandlingWrapper(controller.getBookmarks)
// );
router.put(
  "/:id",
  temporaryAccess,
  errorHandlingWrapper(controller.updatePost),
);
// router.put(
//   "/:id/bookmark",
//   temporaryAccess,
//   errorHandlingWrapper(controller.toggleBookmark)
// );
router.get(
  "/:id",
  temporaryAccess,
  errorHandlingWrapper(controller.getPostById),
);
router.delete(
  "/:id",
  temporaryAccess,
  errorHandlingWrapper(controller.deletePost),
);

export default router;
