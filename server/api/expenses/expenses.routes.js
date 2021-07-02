const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const controller = require("./expenses.controller");

router.get("/:month", errorHandlingWrapper(controller.getExpensesByMonth));
router.post("/", errorHandlingWrapper(controller.createExpense));
router.put("/:id", errorHandlingWrapper(controller.updateExpense));
router.delete("/:id", errorHandlingWrapper(controller.deleteExpense));

module.exports = router;
