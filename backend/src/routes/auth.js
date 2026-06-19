const express = require("express");
const router = express.Router();
const { createTeam, joinTeam, login } = require("../controllers/authController");

router.post("/create-team", createTeam);
router.post("/join-team", joinTeam);
router.post("/login", login);

module.exports = router;
