const router = require('express').Router();
const controller = require('./controller');
const auth = require('../../auth/auth');
const checkUser = [auth.decodeToken(), auth.getFreshUser()];

router.param('id', controller.findById);
router.get('/me', checkUser, controller.me);
router.get('/:username/resume', controller.getResume);
router.put('/resume', checkUser, controller.updateResume);

router
  .route('/')
  .get(controller.getAll)
  .post(controller.create);

router
  .route('/:id')
  .get(checkUser, controller.getOne)
  .put(checkUser, controller.update)
  .delete(checkUser, controller.delete);

module.exports = router;
