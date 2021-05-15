const chalk = require("chalk");

const chalkError = chalk.red;
const chalkLog = chalk.green;
const chalkTest = chalk.bgYellow.italic;

const logger = {
  log: (...args) => console.log(chalkLog("[LOG]:", ...args)),
  error: (...error) => console.log(chalkError("[ERROR]:", ...error)),
  test: (...test) => console.log(chalkTest("[TEST]:", ...test)),
};

module.exports = logger;
