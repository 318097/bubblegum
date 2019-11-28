const router = require('express').Router();
const controller = require('./controller');
const asyncMiddleware = require('../../middleware/async');

const { externalAccess } = require('../../auth/auth');

router.get('/', asyncMiddleware(controller.getAllPosts))
router.get('/:id', asyncMiddleware(controller.getPostById));
router.post('/', externalAccess, asyncMiddleware(controller.createPost));
router.put('/:id', externalAccess, asyncMiddleware(controller.updatePost));
router.delete('/:id', externalAccess, asyncMiddleware(controller.deletePost));

module.exports = router;
