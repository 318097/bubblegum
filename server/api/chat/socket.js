const { createMessage } = require("./controller");

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
    console.log("New connection..");

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

    socket.on(MESSAGE, async message => {
      const matchedUser = connections.find(
        user => user.userId === message.receiver
      );

      message.delivered = matchedUser ? true : false;
      const result = createMessage(message);

      if (matchedUser) {
        socket
          .to(matchedUser.socketId)
          .emit(NEW_MESSAGE, { ...message, _id: result._id });
      }
    });

    socket.on(DISCONNECT, () => {
      connections = connections.filter(user => user.socketId !== socket.id);
      console.log("User disconnected..");
    });
  });
};
