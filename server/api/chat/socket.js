const uuid = require("uuid");
const {
  CONNECTION,
  USER_INFO,
  MESSAGE,
  DISCONNECT,
  NEW_MESSAGE
} = require("./constants");

let connections = [];

module.exports = io => {
  io.of("/chat").on(CONNECTION, socket => {
    connections.push({ socketId: socket.id });
    console.log("New connection..", connections);

    socket.on(USER_INFO, ({ userId }) => {
      connections = connections.map(user =>
        user.socketId === socket.id
          ? {
              ...user,
              userId
            }
          : user
      );
    });

    socket.on(MESSAGE, message => {
      const matchedUser = connections.find(
        user => user.userId === message.receiver
      );
      if (matchedUser) {
        socket
          .to(matchedUser.socketId)
          .emit(NEW_MESSAGE, { ...message, _id: Math.random() });
      }
    });

    socket.on(DISCONNECT, () => {
      connections = connections.filter(user => user.socketId !== socket.id);
      console.log("User disconnected..");
    });
  });
};
