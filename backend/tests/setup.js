/**
 * Test setup — uses a real test database (set DATABASE_URL in .env.test;
 * loaded by tests/loadEnv.js). Cleans tables between test suites.
 */
const pool = require("../src/config/db");
const redis = require("../src/config/redis");

async function clearDatabase() {
  await pool.query("TRUNCATE blockers, standup_entries, users, teams RESTART IDENTITY CASCADE");
}

async function closeConnections() {
  await pool.end();
  redis.disconnect();
}

module.exports = { clearDatabase, closeConnections };
