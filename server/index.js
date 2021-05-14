const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const connectToDb = require("./db");
const config = require("./config");
const logger = require("./util/logger");
const authRoutes = require("./auth/routes");
const api = require("./api");

logger.log(`Running in ${process.env.NODE_ENV} mode.`);

connectToDb();

require("./api/snake/socket")(io);
require("./api/chat/socket")(io);

require("./middleware/appMiddleware")(app);

app.use("/api", api);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token");
    return;
  }
  res.status(500).send(err);
});

http.listen(config.PORT, () => logger.log(`Listening on :${config.PORT}`));
