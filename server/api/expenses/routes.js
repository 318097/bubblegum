const router = require('express').Router();
const controller = require('./controller');

router.get('/types', controller.getAllExpenseTypes);
router.get('/', controller.getAllExpenses)
router.get('/:month', controller.getMonthlyExpense);

router.post('/', controller.createExpense);
router.post('/types', controller.createExpenseType);

router.put('/types/:id', controller.updateExpenseType);
router.put('/:id', controller.updateExpense);

router.delete('/types/:id', controller.deleteExpenseType);
router.delete('/:id', controller.deleteExpense);

module.exports = router;
