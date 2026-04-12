const colorize =
  (open, close) =>
  (...args) =>
    `${open}${args.map((arg) => String(arg)).join(" ")}${close}`;

const logStyle = colorize("\u001b[32m", "\u001b[0m");
const errorStyle = colorize("\u001b[31m", "\u001b[0m");
const testStyle = colorize("\u001b[43m\u001b[30m\u001b[3m", "\u001b[0m");

const logger = {
  log: (...args) => console.log(logStyle("[log]:", ...args)),
  error: (...error) => console.error(errorStyle("[error]:", ...error)),
  test: (...test) => console.info(testStyle("[test]:", ...test)),
};

export default logger;
