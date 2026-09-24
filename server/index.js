import "./instrument.js";
import express from "express";
import * as Sentry from "@sentry/node";
import { Server as HttpServer } from "http";
import connectToDb from "./db.js";
import config from "./config.js";
import logger from "./utils/logger.js";
import middlewares from "./middleware.js";
import { connectToRedis } from "./redis.js";

const app = express();
const http = new HttpServer(app);

logger.system("Connecting to DB Source:", config.DB_SOURCE);

logger.system(
  `Server started in '${config.NODE_ENV}' mode ${config.IS_PROD ? "💀" : ""}`,
);

await connectToDb();
await connectToRedis();

middlewares(app);

if (config.DB_SOURCE === "CIRCLE") {
  // v2 routes - Circle, Liquid, Fusion
  const { default: authRoutesV2 } = await import("./auth/v2/auth.routes.js");
  const { default: apiV2 } = await import("./api/v2/index.js");
  app.use("/api/v2/auth", authRoutesV2);
  app.use("/api/v2", apiV2);
} else {
  const { default: authRoutes } = await import("./auth/v1/auth.routes.js");
  const { default: api } = await import("./api/v1/index.js");
  app.use("/api/auth", authRoutes);
  app.use("/api", api);
}

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
