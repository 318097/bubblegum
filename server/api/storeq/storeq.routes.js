import { Router } from "express";
const router = Router();
import errorHandlingWrapper from "../../middleware/error-handling.js";
import * as controller from "./storeq.controller.js";

router.get("/stores", errorHandlingWrapper(controller.getAllStores));
router.get(
  "/booking/store/:id",
  errorHandlingWrapper(controller.showAllBookingsForStore),
);
router.get(
  "/booking/buyer/:id",
  errorHandlingWrapper(controller.showAllBookingsForBuyer),
);
router.post("/booking", errorHandlingWrapper(controller.createBooking));
router.put("/booking/:id", errorHandlingWrapper(controller.updateBooking));

// router.delete('/:id', errorHandlingWrapper(controller.cancelBooking));

export default router;
