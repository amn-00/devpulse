const express = require("express");
const router = express.Router();
const { createTeam, joinTeam, login, demoLogin } = require("../controllers/authController");

router.post("/create-team", createTeam);
router.post("/join-team", joinTeam);
router.post("/login", login);
router.post("/demo", demoLogin);

module.exports = router;
