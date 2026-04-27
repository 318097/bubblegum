import { inspect } from "node:util";

const formatArg = (arg) => {
  if (typeof arg === "string") {
    return arg;
  }

  try {
    const json = JSON.stringify(arg, null, 2);

    if (json !== undefined) {
      return json;
    }
  } catch {
    // Fall back to inspect for circular or non-JSON-safe values.
  }

  return inspect(arg, {
    depth: null,
    colors: false,
    compact: false,
  });
};

const colorize =
  (open, close) =>
  (...args) =>
    `${open}${args.map((arg) => formatArg(arg)).join(" ")}${close}`;

const logStyle = colorize("\u001b[0m", "\u001b[0m"); // Default color for logs
const errorStyle = colorize("\u001b[31m", "\u001b[0m"); // Red color for errors
const infoStyle = colorize("\u001b[34m", "\u001b[0m"); // Blue color for info
const systemStyle = colorize("\u001b[32m", "\u001b[0m"); // Green color for system messages
const errorPrefix = errorStyle("[ERROR] ");
const fatalPrefix = errorStyle("[FATAL] ");

const logger = {
  log: (...args) => console.log(logStyle("[LOG] ", ...args)),
  error: (...error) => console.error(errorPrefix, ...error),
  info: (...info) => console.info(infoStyle("[INFO] ", ...info)),
  system: (...args) => console.log(systemStyle("[SYSTEM] ", ...args, "✅")),
  fatal: (...error) => console.error(fatalPrefix, ...error, "❌"),
};

export default logger;
