import { Router } from "express";
import * as controller from "./storeq.controller.js";

const router = Router();

router.get("/stores", controller.getAllStores);
router.get("/booking/store/:id", controller.showAllBookingsForStore);
router.get("/booking/buyer/:id", controller.showAllBookingsForBuyer);
router.post("/booking", controller.createBooking);
router.put("/booking/:id", controller.updateBooking);

// router.delete('/:id', (controller.cancelBooking));

export default router;
