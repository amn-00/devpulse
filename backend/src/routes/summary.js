const express = require("express");
const router = express.Router();
const { authenticate, requireManager } = require("../middleware/auth");
const { generateSummary } = require("../controllers/summaryController");

// Only managers can generate team summaries
router.post("/summary", authenticate, requireManager, generateSummary);

module.exports = router;
