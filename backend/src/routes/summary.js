const express = require("express");
const router = express.Router();
const { authenticate, requireManager } = require("../middleware/auth");
const { generateSummary } = require("../controllers/summaryController");
const { summaryLimiter } = require("../middleware/rateLimit");

// Only managers can generate team summaries
router.post("/summary", summaryLimiter, authenticate, requireManager, generateSummary);

module.exports = router;
