const express = require("express");
const serverless = require("serverless-http");
require("encoding");
const app = express();

const connectToDb = require("../db");
const config = require("../config");
const logger = require("../server/util/logger");
const authRoutes = require("../server/auth/routes");
const api = require("./routes");

logger.log(`Running in ${process.env.NODE_ENV} mode.`);

app.use("/.netlify/functions/api", async (req, res, next) => {
  await connectToDb();
  next();
});

require("../server/middleware/appMiddleware")(app);

app.use("/.netlify/functions/api", api);
// app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token");
    return;
  }
  res.status(500).send(err);
});

module.exports.handler = serverless(app);
