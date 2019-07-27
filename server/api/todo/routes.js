const router = require('express').Router();
const controller = require('./controller');

router.get('/', controller.getAllTodos);
router.get('/:id', controller.getTodoById);
router.post('/', controller.createTodo);
router.put('/:id', controller.updateTodo);
router.put('/:id/stamp', controller.stampTodo);
router.delete('/:id', controller.deleteTodo);

module.exports = router;