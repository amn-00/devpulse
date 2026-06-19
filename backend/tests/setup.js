/**
 * Test setup — uses a real test database (set TEST_DATABASE_URL in .env.test)
 * Cleans tables between test suites.
 */
require("dotenv").config({ path: ".env.test" });
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
