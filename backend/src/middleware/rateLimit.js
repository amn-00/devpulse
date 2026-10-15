/**
 * Per-IP rate limits for public and expensive endpoints.
 * The demo hands every visitor a manager token, so without these anyone
 * could loop /api/summary and burn through the Groq quota.
 */
const { rateLimit } = require("express-rate-limit");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function limiter(limit, message) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
    skip: () => process.env.NODE_ENV === "test",
  });
}

// Login / create-team / join-team — slows down password guessing
const authLimiter = limiter(20, "Too many attempts, please try again in a few minutes");

// Demo login re-seeds data, so it is relatively expensive
const demoLimiter = limiter(10, "Too many demo logins, please try again in a few minutes");

// Each call is a paid LLM request
const summaryLimiter = limiter(10, "Too many summaries generated, please try again in a few minutes");

module.exports = { authLimiter, demoLimiter, summaryLimiter };
