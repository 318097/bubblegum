const router = require('express').Router();
const controller = require('./controller');
const auth = require('../../auth/auth');
const checkUser = [auth.decodeToken(), auth.getFreshUser()];

router.param('id', controller.findById);

router.route('/').get(controller.getAll);
// .post(controller.create);

router
  .route('/:id')
  .get(controller.findById)
  // .put(controller.update)
  .delete(controller.delete);

module.exports = router;
