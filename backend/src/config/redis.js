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

module.exports = redis;
