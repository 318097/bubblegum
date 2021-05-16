const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./chat.controller");


router.get("/contact-list", errorHandlingWrapper(controller.getContactList));
router.get(
  "/user-chat/:receiverId",
  errorHandlingWrapper(controller.getUserChat)
);

module.exports = router;
