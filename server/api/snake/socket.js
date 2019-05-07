
const statusCodes = require('./constants');
module.exports = (io) => {
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
};