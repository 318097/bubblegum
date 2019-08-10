const _ = require("lodash");
const config = require("../../config");

const logger = {
  log: (...args) => {
    console.log("[LOG]", ...args);
  }
};

module.exports = logger;
