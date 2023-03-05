require("dotenv").config();

const {
  PORT,
  DB_URL,
  STAGING_DB_URL,
  JWT,
  CLOUDINARY_API_SECRET,
  EMAIL_PASSWORD,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SENDGRID_API_KEY,
} = process.env;

let { NODE_ENV } = process.env;
NODE_ENV = NODE_ENV || "staging";

const IS_PROD = ["production", "express-lambda-production"].includes(NODE_ENV);

const DB_CONNECTION_URL = IS_PROD
  ? DB_URL
  : NODE_ENV === "staging"
  ? STAGING_DB_URL
  : "mongodb://localhost/bubblegum";

const config = {
  NODE_ENV,
  IS_PROD,
  PORT: PORT || 7000,
  JWT: JWT || "bubblegum-server",
  DB_URL: DB_CONNECTION_URL,
  CLOUDINARY_API_SECRET,
  MEDIUM_RSS_FEED: "https://medium.com/feed/@ml318097",
  EMAIL_ID: "codedrops.tech@gmail.com",
  EMAIL_PASSWORD,
  GOOGLE_OAUTH: {
    CLIENT_ID: GOOGLE_CLIENT_ID,
    CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
    REDIRECT_URL: "http://localhost:3000/login",
  },
  // ENABLE_EMAIL: IS_PROD,
  ENABLE_EMAIL: true,
  SENDGRID_API_KEY,
  ALLOWED_PRODUCT_SOURCES: ["QUICK_SWITCH"], // allow sending emails for these sources as they dont have a fixed URL
};

module.exports = config;
