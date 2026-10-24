import { createClient } from "redis";
import config from "./config.js";
import logger from "./utils/logger.js";
import _ from "lodash";

let redis = null;
const REDIS_EXPIRY = 60 * 60 * 24 * 5; // 5 days

const connectToRedis = async () => {
  if (!config.REDIS_CONFIG) {
    logger.warn("REDIS_CONFIG not set, skipping Redis connection");
    return;
  }
  if (redis) return;

  const client = createClient({
    ...config.REDIS_CONFIG,
    // fail commands while disconnected instead of queueing them until a
    // reconnect, which would hold the request until the function times out
    disableOfflineQueue: true,
    socket: {
      ...config.REDIS_CONFIG.socket,
      // first connect failed: give up (otherwise `connect` retries forever and
      // startup never finishes) and run without cache. Once connected, keep
      // reconnecting with backoff.
      reconnectStrategy: (retries) =>
        redis ? Math.min(2 ** retries * 50, 2000) : false,
    },
  });
  client.on("error", (err) => logger.error("[Redis]", err.message));

  try {
    await client.connect();
    redis = client;
  } catch (err) {
    logger.error("[Redis] unavailable, running without cache", err.message);
  }
};

// Cache is best-effort: when Redis is down or a command fails, reads are a
// cache miss and writes are skipped.
const addToRedis = async (key, value, req, expiryInSeconds = REDIS_EXPIRY) => {
  if (!redis?.isReady) {
    logger.warn("Redis not connected, skipping addToRedis");
    return;
  }
  const finalKey = generateKey(key, req);
  const finalValue = typeof value === "string" ? value : JSON.stringify(value);
  try {
    await redis.set(finalKey, finalValue, {
      EX: expiryInSeconds,
    });
  } catch (err) {
    logger.error("[Redis] addToRedis", err.message);
  }
};

const getFromRedis = async (key, req) => {
  if (!redis?.isReady) {
    logger.warn("Redis not connected, skipping getFromRedis");
    return null;
  }
  const finalKey = generateKey(key, req);
  try {
    const value = await redis.get(finalKey);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error("[Redis] getFromRedis", err.message);
    return null;
  }
};

const generateKey = (key, req) => {
  return [_.toLower(_.trim(key)), req?.userId].filter(Boolean).join(":");
};

export { connectToRedis, addToRedis, getFromRedis };
