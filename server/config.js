require("dotenv").config();

const {
  NODE_ENV,
  PORT,
  DB_URL,
  STAGING_DB_URL,
  JWT,
  CLOUDINARY_API_SECRET,
  EMAIL_PASSWORD,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

const IS_PROD = ["production", "express-lambda-production"].includes(NODE_ENV);

const DB_CONNECTION_URL = IS_PROD
  ? DB_URL
  : NODE_ENV === "staging"
  ? STAGING_DB_URL
  : "mongodb://localhost/bubblegum";

const config = {
  NODE_ENV: NODE_ENV || "development",
  IS_PROD,
  PORT: PORT || 7000,
  JWT: JWT || "bubblegum-server",
  DB_URL: DB_CONNECTION_URL,
  CLOUDINARY_API_SECRET,
  MEDIUM_RSS_FEED: "https://medium.com/feed/@318097",
  EMAIL_ID: "codedrops.tech@gmail.com",
  EMAIL_PASSWORD,
  ENABLE_EMAIL: false,
  GOOGLE_OAUTH: {
    CLIENT_ID: GOOGLE_CLIENT_ID,
    CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
    REDIRECT_URL: "http://localhost:3000/login",
  },
};

console.log("TEST");
module.exports = config;
