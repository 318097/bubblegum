import { Router } from "express";
import errorHandlingWrapper from "../../../middleware/error-handling.js";
import * as controller from "./links.controller.js";

const router = Router();

router.get(
  "/:collectionId",
  errorHandlingWrapper(controller.getLynksByCollectionId),
);

router.post(
  "/:collectionId",
  errorHandlingWrapper(controller.createOrUpdateLink),
);

router.delete(
  "/:collectionId/:linkId",
  errorHandlingWrapper(controller.deleteLink),
);

export default router;
