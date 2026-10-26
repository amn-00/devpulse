const express = require("express");
const router = express.Router();
const { authenticate, requireManager } = require("../middleware/auth");
const {
  createEntry,
  getMyEntries,
  getDashboard,
  resolveBlocker,
} = require("../controllers/standupController");

router.use(authenticate); // all routes below require a valid JWT

router.post("/standup", createEntry);
router.get("/standup/mine", getMyEntries);
// Team-wide views and actions are manager-only
router.get("/dashboard", requireManager, getDashboard);
router.patch("/blockers/:id/resolve", requireManager, resolveBlocker);

module.exports = router;
