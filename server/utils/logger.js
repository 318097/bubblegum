import { inspect } from "node:util";

const colorize =
  (open, close) =>
  (...args) =>
    `${open}${args
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : inspect(arg, {
              depth: null,
              colors: false,
              compact: true,
            }),
      )
      .join(" ")}${close}`;

const logStyle = colorize("\u001b[0m", "\u001b[0m"); // Default color for logs
const errorStyle = colorize("\u001b[31m", "\u001b[0m"); // Red color for errors
const infoStyle = colorize("\u001b[34m", "\u001b[0m"); // Blue color for info
const systemStyle = colorize("\u001b[32m", "\u001b[0m"); // Green color for system messages

const logger = {
  log: (...args) => console.log(logStyle("[LOG] ", ...args)),
  error: (...error) => console.error(errorStyle("[ERROR] ", ...error)),
  info: (...info) => console.info(infoStyle("[INFO] ", ...info)),
  system: (...args) => console.log(systemStyle("[SYSTEM] ", ...args, "✅")),
  fatal: (...error) => console.error(errorStyle("[FATAL] ", ...error, "❌")),
};

export default logger;
