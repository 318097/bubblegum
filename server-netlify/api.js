const express = require("express");
const serverless = require("serverless-http");

const app = express();

const connectToDb = require("../server/db");
const apiRoutes = require("../server/api");
const authRoutes = require("../server/auth/auth.routes");

app.use("/.netlify/functions/api", async (req, res, next) => {
  await connectToDb();
  next();
});

require("../server/middleware/app-middleware")(app);

app.use("/.netlify/functions/api/auth", authRoutes);
app.use("/.netlify/functions/api", apiRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("INVALID_TOKEN");
    return;
  }
  res.status(500).send(err);
});

module.exports.handler = serverless(app);
