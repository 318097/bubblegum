const router = require('express').Router();
const userRoutes = require('./user/routes');
const postRoutes = require('./post/routes');
const expenseRoutes = require('./expenses/routes');
const diaryRoutes = require('./diary/routes');
const snakeGameRoutes = require('./snake/routes');

const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getFreshUser()];

router.get('/test', (req, res) => res.send('Test'));

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/exp', checkUser, expenseRoutes);
router.use('/diary', checkUser, diaryRoutes);
router.use('/snake', snakeGameRoutes);

module.exports = router;
