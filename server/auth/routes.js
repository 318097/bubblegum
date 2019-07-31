const router = require('express').Router();
const verifyUser = require('./auth').verifyUser;
const controller = require('./controller');

router.post('/login', verifyUser(), controller.login);
router.post('/register', controller.register);

module.exports = router;
