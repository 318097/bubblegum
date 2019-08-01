const router = require('express').Router();
const controller = require('./controller');
const { private } = require('../../auth/auth');

router.param('id', controller.findById);
router.get('/me', private(), controller.me);
router.get('/:username/resume', controller.getResume);
router.put('/resume', private(), controller.updateResume);

router
  .route('/')
  .get(controller.getAll)
  .post(controller.create);

router
  .route('/:id')
  .get(private(), controller.getOne)
  .put(private(), controller.update)
  .delete(private(), controller.delete);

module.exports = router;
