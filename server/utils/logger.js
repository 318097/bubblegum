import { inspect } from "node:util";
import config from "../config.js";

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
    config.COLOR_LOGS && open
      ? `${open}${args.map((arg) => formatArg(arg)).join(" ")}${close}`
      : args.map((arg) => formatArg(arg)).join(" ");

const logStyle = colorize("", ""); // Default color for logs
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
