/**
 * Redis connection (via ioredis)
 * Works with Upstash, Redis Cloud, or local Redis
 */
const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL, {
  // Upstash and most cloud providers require TLS — ioredis auto-detects from rediss:// URLs
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

/**
 * Best-effort cache helpers — Redis is only a cache, so if it is down
 * requests fall back to Postgres instead of failing.
 */
async function cacheGet(key) {
  try {
    return await redis.get(key);
  } catch (err) {
    console.error(`Cache get failed (${key}):`, err.message);
    return null;
  }
}

async function cacheSet(key, ttlSeconds, value) {
  try {
    await redis.setex(key, ttlSeconds, value);
  } catch (err) {
    console.error(`Cache set failed (${key}):`, err.message);
  }
}

async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`Cache delete failed (${key}):`, err.message);
  }
}

module.exports = redis;
module.exports.cacheGet = cacheGet;
module.exports.cacheSet = cacheSet;
module.exports.cacheDel = cacheDel;
