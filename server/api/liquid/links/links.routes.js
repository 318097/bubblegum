import { Router } from "express";
import * as controller from "./links.controller.js";

const router = Router();

router.get("/:collectionId", controller.getLynksByCollectionId);

router.post("/:collectionId", controller.createOrUpdateLink);

router.delete("/:collectionId/:linkId", controller.deleteLink);

export default router;
