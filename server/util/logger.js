const chalk = require("chalk");
const config = require("../../config");

const chalkError = chalk.red;
const chalkLog = chalk.green;

const logger = {
  log: (...args) => console.log(chalkLog("[LOG]:", ...args)),
  error: (...error) => console.log(chalkError("[ERROR]:", ...error)),
};

module.exports = logger;
