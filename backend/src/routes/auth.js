const express = require("express");
const router = express.Router();
const { createTeam, joinTeam, login, demoLogin } = require("../controllers/authController");
const { authLimiter, demoLimiter } = require("../middleware/rateLimit");

router.post("/create-team", authLimiter, createTeam);
router.post("/join-team", authLimiter, joinTeam);
router.post("/login", authLimiter, login);
router.post("/demo", demoLimiter, demoLogin);

module.exports = router;
