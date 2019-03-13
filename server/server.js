const express = require('express');
const app = express();
const api = require('./api/api');
const config = require('./config/config');
const logger = require('./util/logger');
const auth = require('./auth/routes');

require('mongoose').connect(
  config.db_url,
  { useNewUrlParser: true }
);

// if (config.seed) {
//   require('./util/seed');
// }

require('./middleware/appMiddleware')(app);
app.use('/api', api);
app.use('/api/auth', auth);

app.use(function (err, req, res, next) {
  // if error thrown from jwt validation check
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
    return;
  }
  console.log(err);
  res.status(500).send('Oops');
});

module.exports = app;
