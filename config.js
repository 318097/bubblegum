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

const config = {
  PORT: PORT || 7000,
  JWT: JWT || "brainbox",
  DB_URL:
    NODE_ENV === "production"
      ? DB_URL
      : NODE_ENV === "staging"
      ? STAGING_DB_URL
      : "mongodb://localhost/bubblegum",
  NETLIFY_DB_URL,
  GOOGLE_LOGIN_CLIENT_ID,
  CLOUDINARY_API_SECRET,
};

module.exports = config;
