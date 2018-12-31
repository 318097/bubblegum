const router = require('express').Router();
const userRoutes = require('./user/routes');
const postRoutes = require('./post/routes');
const expenseRoutes = require('./expenses/routes');
const diaryRoutes = require('./diary/routes');

const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getFreshUser()];

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/exp', checkUser, expenseRoutes);
router.use('/diary', checkUser, diaryRoutes);

module.exports = router;
