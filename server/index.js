const express = require("express");

const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const connectToDb = require("./db");
const config = require("./config");
const logger = require("./utils/logger");

const authRoutes = require("./auth/auth.routes");
const api = require("./api");
const { startApolloServerExpress } = require("./graphql");

logger.log(
  `Server started in '${config.NODE_ENV}' mode ${config.IS_PROD ? "💀" : ""}`,
);

connectToDb();

require("./api/snake/snake.socket")(io);
require("./api/chat/chat.socket")(io);

require("./middleware/app-middleware")(app);

startApolloServerExpress(app);

app.use("/api/auth", authRoutes);
app.use("/api", api);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error("[Middleware] ", err);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("INVALID_JWT_TOKEN");
    return;
  }
  res.status(500).send(err);
});

http.listen(config.PORT, () => logger.log(`Running on port ':${config.PORT}'`));
