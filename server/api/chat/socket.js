const { createMessage, updateMessage } = require("./controller");

const {
  CONNECTION,
  USER_INFO,
  MESSAGE,
  DISCONNECT,
  NEW_MESSAGE,
  UPDATE_MESSAGE_REQUEST,
  MESSAGE_UPDATE
} = require("./constants");

let connections = [];

const findConnectionByUserId = userId =>
  connections.find(user => user.userId === userId.toString());

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
      const matchedUser = findConnectionByUserId(message.receiver);

      message.delivered = matchedUser ? true : false;
      const result = await createMessage(message);
      // console.log("new message", result);

      if (matchedUser) {
        socket
          .to(matchedUser.socketId)
          .emit(NEW_MESSAGE, { ...message, _id: result._id });
      }
    });

    socket.on(
      UPDATE_MESSAGE_REQUEST,
      async ({ tempId, _id: messageId, userId, message }) => {
        const updatedMessage = {
          [`metaInfo.${userId}`]: message
        };
        const result = await updateMessage(tempId, messageId, updatedMessage);
        // console.log("Result:::", result);
        const {
          metaInfo,
          _id,
          sender: senderId,
          receiver: receiverId
        } = result;

        const ids = [senderId, receiverId];
        ids.forEach(id => {
          if (id !== userId) {
            const receiver = findConnectionByUserId(id);
            if (receiver)
              socket
                .to(receiver.socketId)
                .emit(MESSAGE_UPDATE, { metaInfo, _id, tempId });
          }
        });

        socket.emit(MESSAGE_UPDATE, { metaInfo, _id, tempId });
      }
    );

    socket.on(DISCONNECT, () => {
      connections = connections.filter(user => user.socketId !== socket.id);
      console.log("User disconnected..");
    });
  });
};
