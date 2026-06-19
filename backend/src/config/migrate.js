/**
 * Database migration — creates all tables with proper foreign keys.
 * Run with: npm run migrate
 */
const pool = require("./db");

const SCHEMA = `
-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'manager')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Standup entries table
CREATE TABLE IF NOT EXISTS standup_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  yesterday TEXT NOT NULL,
  today TEXT NOT NULL,
  has_blocker BOOLEAN DEFAULT FALSE,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Blockers table (separate so they can be tracked/resolved independently)
CREATE TABLE IF NOT EXISTS blockers (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES standup_entries(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_entries_team_date ON standup_entries(team_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_blockers_team_resolved ON blockers(team_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_blockers_created ON blockers(created_at);
`;

async function migrate() {
  console.log("Running migrations...");
  try {
    await pool.query(SCHEMA);
    console.log("✅ Migration complete — tables created");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
