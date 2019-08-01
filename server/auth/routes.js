const router = require('express').Router();
const { verifyUser } = require('./auth');
const controller = require('./controller');
const asyncMiddleware = require('../middleware/async');

router.post('/login', verifyUser, asyncMiddleware(controller.login));
router.post('/register', asyncMiddleware(controller.register));

module.exports = router;
