const router = require('express').Router();
const controller = require('./controller');
const asyncMiddleware = require('../../middleware/async');

router.get('/', asyncMiddleware(controller.getAllPosts))
router.get('/:id', asyncMiddleware(controller.getPostById));
router.post('/', asyncMiddleware(controller.createPost));
router.put('/:id', asyncMiddleware(controller.updatePost));
router.delete('/:id', asyncMiddleware(controller.deletePost));

module.exports = router;
