require("dotenv").config();

const {
  NODE_ENV,
  PORT,
  DB_URL,
  STAGING_DB_URL,
  NETLIFY_DB_URL,
  JWT,
  GOOGLE_LOGIN_CLIENT_ID,
  CLOUDINARY_API_SECRET,
} = process.env;

const IS_PROD = NODE_ENV === "production";

const config = {
  PORT: PORT || 7000,
  JWT: JWT || "brainbox",
  DB_URL: IS_PROD
    ? DB_URL
    : NODE_ENV === "staging"
    ? STAGING_DB_URL
    : "mongodb://localhost/bubblegum",
  NETLIFY_DB_URL,
  GOOGLE_LOGIN_CLIENT_ID,
  CLOUDINARY_API_SECRET,
  NODE_ENV: NODE_ENV || "development",
  IS_PROD,
  MEDIUM_RSS_FEED: "https://medium.com/feed/@318097",
};

module.exports = config;
