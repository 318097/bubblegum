const router = require("express").Router();
const controller = require("./controller");

const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/contact-list", errorHandlingWrapper(controller.getContactList));
router.get(
  "/user-chat/:receiverId",
  errorHandlingWrapper(controller.getUserChat)
);

module.exports = router;
