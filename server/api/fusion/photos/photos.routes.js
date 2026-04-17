import { Router } from "express";
import errorHandlingWrapper from "../../../middleware/error-handling.js";
import * as controller from "./photos.controller.js";

const router = Router();

router.get(
  "/:albumId",
  // temporaryAccess,
  errorHandlingWrapper(controller.getAllPhotosByAlbum),
);

router.post(
  "/files/:albumId",
  errorHandlingWrapper(controller.addFilesToAlbum),
);

router.put(
  "/files/:albumId",
  errorHandlingWrapper(controller.updateFilesInAlbum),
);

export default router;
