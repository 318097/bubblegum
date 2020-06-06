const router = require("express").Router();
const controller = require("./controller");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/stores", errorHandlingWrapper(controller.getAllStores));
router.get(
  "/booking/store/:id",
  errorHandlingWrapper(controller.showAllBookingsForStore)
);
router.get(
  "/booking/buyer/:id",
  errorHandlingWrapper(controller.showAllBookingsForBuyer)
);
router.post("/booking", errorHandlingWrapper(controller.createBooking));
router.put("/booking/:id", errorHandlingWrapper(controller.updateBooking));
// router.delete('/:id', errorHandlingWrapper(controller.cancelBooking));

module.exports = router;
