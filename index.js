const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = require('./server/config/config');
const logger = require('./server/util/logger');
const auth = require('./server/auth/routes');
const api = require('./server/api/api');
const statusCodes = require('./server/api/snake/constants');

require('mongoose').connect(
  config.db_url,
  { useNewUrlParser: true }
);
/* ------ Socket ------ */
const createRoom = () => ({
  isFree: true,
  player1: { status: statusCodes.INITIAL },
  player2: { status: statusCodes.INITIAL },
  gameStatus: statusCodes.INITIAL,
  food: {},
  players: []
});

const gameConfig = {
  n: 20
};

const createFood = () => {
  const x = Math.floor((Math.random() * 100) % gameConfig.n);
  const y = Math.round((Math.random() * 100) % gameConfig.n);
  return { x, y };
}

let game = createRoom();
io.on('connection', socket => {
  socket.on('join-game', playerId => {
    // game.players.push(playerId);
    if (game.isFree) {
      game.player1.id = playerId;
      game.isFree = false;
      console.log('P1: New connection: ', playerId);
    } else {
      game.player2.id = playerId;
      io.emit('start-game');
      console.log('P2: New connection: ', playerId);
    }
  });

  socket.on('game-status', (updates) => {
    if (updates.type === 'FOOD') {
      updates.data = createFood();
    }
    io.emit('game-updates', updates);
  });

  socket.on('player-dead', playerId => {
    const playerNo = game.player1.id === playerId ? 'player1' : game.player2.id === playerId ? 'player2' : null;
    if (playerNo) {
      game[playerNo]['status'] = statusCodes.DEAD;
      console.log(`${playerNo} dead with uid: ${playerId}`);
      if (game.player1.status === statusCodes.DEAD && game.player2.status === statusCodes.DEAD) {
        io.emit('game-over');
        game = createRoom();
        console.log('Game over');
      }
    }
  });

  socket.on('disconnect', playerId => {
    game = createRoom();
  });
});
/* ------ Socket ------ */

// if (config.seed) {
//   require('./server/util/seed');
// }
require('./server/middleware/appMiddleware')(app);

// app.use(function (req, res, next) {
//   console.log('URL:', req.url);
//   if (/snake/.test(req.url)) {
//     req.socket = io;
//   }
//   next();
// });

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