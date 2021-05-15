const router = require("express").Router();
const controller = require("./chat.controller");

const errorHandlingWrapper = require("../../middleware/error-handling");

router.get("/contact-list", errorHandlingWrapper(controller.getContactList));
router.get(
  "/user-chat/:receiverId",
  errorHandlingWrapper(controller.getUserChat)
);

module.exports = router;
