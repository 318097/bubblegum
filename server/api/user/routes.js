const router = require('express').Router();
const controller = require('./controller');
const { protected } = require('../../auth/auth');

router.param('id', controller.findById);
router.get('/me', protected, controller.me);
router.get('/:username/resume', controller.getResume);
router.put('/resume', protected, controller.updateResume);

router
  .route('/')
  .get(controller.getAll)
  .post(controller.create);

router
  .route('/:id')
  .get(protected, controller.getOne)
  .put(protected, controller.update)
  .delete(protected, controller.delete);

module.exports = router;
