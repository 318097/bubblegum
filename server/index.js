import express from "express";

const app = express();

import { Server as HttpServer } from "http";
const http = new HttpServer(app);

import connectToDb from "./db.js";
import config from "./config.js";
import logger from "./utils/logger.js";
import authRoutes from "./auth/auth.routes.js";
import api from "./api/index.js";
import applyPreParserMiddleware from "./middleware/pre-parser.js";

logger.log(
  `Server started in '${config.NODE_ENV}' mode ${config.IS_PROD ? "💀" : ""}`,
);

connectToDb();

applyPreParserMiddleware(app);

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
