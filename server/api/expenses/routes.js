const router = require('express').Router();
const controller = require('./controller');

router
  .route('/')
  .get(controller.getAll)
  .post(controller.create);

router.get('/exp_types', controller.getAllExpenseTypes);
router.get('/:month', controller.getMonthlyExpense);
// router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
