const router = require('express').Router();
const controller = require('./controller');
const errorHandlingWrapper = require('../../middleware/errorHandling');

router.get('/types', errorHandlingWrapper(controller.getAllExpenseTypes));
router.get('/', errorHandlingWrapper(controller.getAllExpenses))
router.get('/:month', errorHandlingWrapper(controller.getMonthlyExpense));

router.post('/', errorHandlingWrapper(controller.createExpense));
router.post('/types', errorHandlingWrapper(controller.createExpenseType));

router.put('/types/:id', errorHandlingWrapper(controller.updateExpenseType));
router.put('/:id', errorHandlingWrapper(controller.updateExpense));

router.delete('/types/:id', errorHandlingWrapper(controller.deleteExpenseType));
router.delete('/:id', errorHandlingWrapper(controller.deleteExpense));

module.exports = router;
