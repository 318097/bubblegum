const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/:id", errorHandlingWrapper(controller.showAllBookings));
router.post("/", errorHandlingWrapper(controller.createBooking));
// router.put('/:id', errorHandlingWrapper(controller.updateBooking));
router.put("/:id/stamp", errorHandlingWrapper(controller.stampBooking));
// router.delete('/:id', errorHandlingWrapper(controller.cancelBooking));

module.exports = router;
