const router = require('express').Router();
const controller = require('./controller');

/* For all routes, which has a param named 'id', run the findById() controller */
router.param('id', controller.findById);

router
  .route('/')
  .get(controller.getAll)
  .post(controller.create);

router
  .route('/:id')
  .get(controller.getOne)
  .put(controller.update)
  .delete(controller.delete);

module.exports = router;
