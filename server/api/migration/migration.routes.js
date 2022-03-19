const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./migration.controller");

// router.get(
//   "/encrypt-passwords",
//   errorHandlingWrapper(controller.encryptPasswords)
// );
// router.get("/mongo", errorHandlingWrapper(controller.mongoDbTest));
router.get(
  "/update-tags-collection",
  errorHandlingWrapper(controller.updateToNewTagsCollection)
);
router.get(
  "/normalize-collections-and-timeline",
  errorHandlingWrapper(controller.normalizeCollectionsAndTimeline)
);

module.exports = router;
