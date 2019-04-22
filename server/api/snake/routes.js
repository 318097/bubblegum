const router = require('express').Router();
const controller = require('./controller');

router.get('/', controller.get)

module.exports = router;
