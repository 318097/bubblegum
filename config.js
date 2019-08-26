require("dotenv").config();

const config = {
  PORT: process.env.PORT || 7000,
  DB_URL: process.env.DB_URL || "mongodb://localhost/bubblegum",
  JWT: process.env.JWT || "brainbox",
  GOOGLE_LOGIN_CLIENT_ID: process.env.GOOGLE_LOGIN_CLIENT_ID
};

module.exports = config;
