const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createEntry,
  getMyEntries,
  getDashboard,
  resolveBlocker,
} = require("../controllers/standupController");

router.use(authenticate); // all routes below require a valid JWT

router.post("/standup", createEntry);
router.get("/standup/mine", getMyEntries);
router.get("/dashboard", getDashboard);
router.patch("/blockers/:id/resolve", resolveBlocker);

module.exports = router;
