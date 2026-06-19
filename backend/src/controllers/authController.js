const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A1B2C3D4"
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, teamId: user.team_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/** POST /api/auth/create-team — creates a new team + manager account */
async function createTeam(req, res) {
  const { teamName, name, email, password } = req.body;

  if (!teamName || !name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inviteCode = generateInviteCode();
    const teamResult = await client.query(
      "INSERT INTO teams (name, invite_code) VALUES ($1, $2) RETURNING *",
      [teamName, inviteCode]
    );
    const team = teamResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, team_id, role)
       VALUES ($1, $2, $3, $4, 'manager') RETURNING id, name, email, team_id, role`,
      [name, email, passwordHash, team.id]
    );
    const user = userResult.rows[0];

    await client.query("COMMIT");

    const token = signToken(user);
    res.status(201).json({ token, user, team });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create team" });
  } finally {
    client.release();
  }
}

/** POST /api/auth/join-team — join an existing team via invite code */
async function joinTeam(req, res) {
  const { inviteCode, name, email, password } = req.body;

  if (!inviteCode || !name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const teamResult = await pool.query(
      "SELECT * FROM teams WHERE invite_code = $1",
      [inviteCode.toUpperCase()]
    );
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid invite code" });
    }
    const team = teamResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, team_id, role)
       VALUES ($1, $2, $3, $4, 'member') RETURNING id, name, email, team_id, role`,
      [name, email, passwordHash, team.id]
    );
    const user = userResult.rows[0];

    const token = signToken(user);
    res.status(201).json({ token, user, team });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to join team" });
  }
}

/** POST /api/auth/login */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { createTeam, joinTeam, login };
