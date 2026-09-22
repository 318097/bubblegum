import "./instrument.js";
import express from "express";
import * as Sentry from "@sentry/node";
import { Server as HttpServer } from "http";
import connectToDb from "./db.js";
import config from "./config.js";
import logger from "./utils/logger.js";
import authRoutes from "./auth/v1/auth.routes.js";
import authRoutesV2 from "./auth/v2/auth.routes.js";
import api from "./api/v1/index.js";
import apiV2 from "./api/v2/index.js";
import middlewares from "./middleware.js";
import { connectToRedis } from "./redis.js";

const app = express();
const http = new HttpServer(app);

console.log("Source:", process.env.SOURCE);

logger.system(
  `Server started in '${config.NODE_ENV}' mode ${config.IS_PROD ? "💀" : ""}`,
);

await connectToDb();
await connectToRedis();

middlewares(app);

app.use("/api/auth", authRoutes);
app.use("/api", api);

// v2 routes - Circle, Liquid, Fusion
app.use("/api/auth/v2", authRoutesV2);
app.use("/api/v2", apiV2);

// app.get("/debug-sentry", function mainHandler(req, res) {
//   throw new Error("[Test] Sentry error!");
// });

if (config.IS_PROD) Sentry.setupExpressErrorHandler(app);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error("[CATCH ALL]", req.originalUrl, "\n", err);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("INVALID_JWT_TOKEN");
    return;
  }
  res.status(500).send(err.message);
});

http.listen(config.PORT, () =>
  logger.system(`Running on port ':${config.PORT}'`),
);
