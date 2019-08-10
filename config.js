const config = {
  PORT: process.env.PORT || 7000,
  DB_URL: process.env.DB_URL || "mongodb://localhost/bubblegum",
  expireTime: 24 * 60 * 10,
  secrets: {
    JWT: process.env.JWT || "brainbox"
  }
};

module.exports = config;
