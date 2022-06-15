const chalk = require("chalk");

const chalkError = chalk.red;
const chalkLog = chalk.green;
const chalkTest = chalk.bgYellow.italic;

const logger = {
  log: (...args) => console.log(chalkLog("[log]:", ...args)),
  error: (...error) => console.log(chalkError("[error]:", ...error)),
  test: (...test) => console.log(chalkTest("[test]:", ...test)),
};

module.exports = logger;
