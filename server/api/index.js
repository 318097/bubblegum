const router = require('express').Router();

const userRoutes = require('./user/routes');
const todoRoutes = require('./todo/routes');
const postRoutes = require('./post/routes');
const expenseRoutes = require('./expenses/routes');
const diaryRoutes = require('./diary/routes');
const snakeGameRoutes = require('./snake/routes');

const { private } = require('../auth/auth');
// const private = [private.decodeToken, private.getFreshUser];

router.get('/test', (req, res) => res.send('Test'));

router.use('/users', userRoutes);
router.use('/todos', private(), todoRoutes);
router.use('/posts', postRoutes);
router.use('/expenses', private(), expenseRoutes);
router.use('/diary', private(), diaryRoutes);
router.use('/snake', snakeGameRoutes);

module.exports = router;
