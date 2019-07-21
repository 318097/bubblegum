const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = require('./server/config');
const logger = require('./server/util/logger');
const auth = require('./server/auth/routes');
const api = require('./server/api');

require('mongoose').connect(
  config.db_url,
  { useNewUrlParser: true }
);

require('./server/api/snake/socket')(io);

// if (config.seed) {
//   require('./server/util/seed');
// }
require('./server/middleware/appMiddleware')(app);

app.use('/api', api);
app.use('/api/auth', auth);

app.use((err, req, res, next) => {
  // if error thrown from jwt validation check
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
    return;
  }
  console.log(err);
  res.status(500).send('Oops');
});

http.listen(config.port);
logger.log(`Listening on PORT:${config.port}`);