const router = require('express').Router();
const controller = require('./controller');
const asyncMiddleware = require('../../middleware/async');

router.get('/', asyncMiddleware(controller.getAllTodos));
router.get('/:id', asyncMiddleware(controller.getTodoById));
router.post('/', asyncMiddleware(controller.createTodo));
router.put('/:id', asyncMiddleware(controller.updateTodo));
router.put('/:id/stamp', asyncMiddleware(controller.stampTodo));
router.delete('/:id', asyncMiddleware(controller.deleteTodo));

module.exports = router;