const router = require('express').Router();
const controller = require('./controller');
const asyncMiddleware = require('../../middleware/async');

router.get('/types', asyncMiddleware(controller.getAllExpenseTypes));
router.get('/', asyncMiddleware(controller.getAllExpenses))
router.get('/:month', asyncMiddleware(controller.getMonthlyExpense));

router.post('/', asyncMiddleware(controller.createExpense));
router.post('/types', asyncMiddleware(controller.createExpenseType));

router.put('/types/:id', asyncMiddleware(controller.updateExpenseType));
router.put('/:id', asyncMiddleware(controller.updateExpense));

router.delete('/types/:id', asyncMiddleware(controller.deleteExpenseType));
router.delete('/:id', asyncMiddleware(controller.deleteExpense));

module.exports = router;
