require("dotenv").config();

const env = process.env.NODE_ENV;

const config = {
  PORT: process.env.PORT || 7000,
  DB_URL:
    env === "production"
      ? process.env.DB_URL
      : env === "staging"
      ? process.env.STAGING_DB_URL
      : "mongodb://localhost/bubblegum",
  JWT: process.env.JWT || "brainbox",
  GOOGLE_LOGIN_CLIENT_ID: process.env.GOOGLE_LOGIN_CLIENT_ID,
};

module.exports = config;
