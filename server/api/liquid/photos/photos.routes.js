import { Router } from "express";
import * as controller from "./photos.controller.js";

const router = Router();

router.get("/:albumId", (controller.getAllPhotosByAlbum));

router.post(
  "/files/:albumId",
  (controller.addFilesToAlbum),
);

router.put(
  "/files/:albumId",
  (controller.updateFilesInAlbum),
);

export default router;
