const express = require('express');
const app = express();
const api = require('./api/api');
const config = require('./config/config');
const logger = require('./util/logger');
const auth = require('./auth/routes');

// database
require('mongoose').connect(
  'mongodb://localhost/bubblegum',
  { useNewUrlParser: true }
);

// if (config.seed) {
//   require('./util/seed');
// }

// middleware
require('./middleware/appMiddleware')(app);
app.use('/api', api);
app.use('/api/auth', auth);

app.use(function(err, req, res, next) {
  // if error thrown from jwt validation check
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
    return;
  }
  console.log(err);
  // logger.log();
  res.status(500).send('Oops');
});

module.exports = app;
