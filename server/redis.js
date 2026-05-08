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

  try {
    redis = createClient(config.REDIS_CONFIG);
    await redis.connect();
  } catch (err) {
    logger.error("[Redis]", err);
    redis = null; // Reset on connection failure
  }

  redis.on("error", (err) => logger.error("[Redis]", err));
};

const addToRedis = async (key, value, req, expiryInSeconds = REDIS_EXPIRY) => {
  if (!redis) {
    logger.warn("Redis not connected, skipping addToRedis");
    return;
  }
  const finalKey = generateKey(key, req);
  const finalValue = typeof value === "string" ? value : JSON.stringify(value);
  await redis.set(finalKey, finalValue, {
    EX: expiryInSeconds,
  });
};

const getFromRedis = async (key, req) => {
  if (!redis) {
    logger.warn("Redis not connected, skipping getFromRedis");
    return null;
  }
  const finalKey = generateKey(key, req);
  const value = await redis.get(finalKey);
  return value ? JSON.parse(value) : null;
};

const generateKey = (key, req) => {
  return [_.toLower(_.trim(key)), req?.userId].filter(Boolean).join(":");
};

export { connectToRedis, addToRedis, getFromRedis };
