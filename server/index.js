/* eslint-disable import/newline-after-import */
const express = require("express");
const app = express();
require("./graphql");

// eslint-disable-next-line import/order
const http = require("http").Server(app);
const io = require("socket.io")(http);

const connectToDb = require("./db");
const config = require("./config");
const logger = require("./utils/logger");
const authRoutes = require("./auth/auth.routes");
const api = require("./api");
const { startApolloServer } = require("./graphql");

logger.log(`Running in ${process.env.NODE_ENV} mode.`);

connectToDb();
startApolloServer(app);

require("./api/snake/snake.socket")(io);
require("./api/chat/chat.socket")(io);

require("./middleware/app-middleware")(app);

app.use("/api/auth", authRoutes);
app.use("/api", api);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token");
    return;
  }
  res.status(500).send(err);
});

http.listen(config.PORT, () => logger.log(`Listening on :${config.PORT}`));
