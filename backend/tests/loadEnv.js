/**
 * Runs before each test file (jest "setupFiles"), before any app code is
 * required — so the pool and Redis client are created with test settings.
 *
 * override: true is needed because src/app.js also calls dotenv.config(),
 * and dotenv never overwrites variables that are already set.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const root = path.join(__dirname, "..");
const envTestPath = path.join(root, ".env.test");
const envPath = path.join(root, ".env");

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: true });
}
process.env.NODE_ENV = "test";

// Tests TRUNCATE every table — refuse to run against the dev/prod database
if (fs.existsSync(envPath)) {
  const mainDbUrl = dotenv.parse(fs.readFileSync(envPath)).DATABASE_URL;
  if (mainDbUrl && mainDbUrl === process.env.DATABASE_URL) {
    throw new Error(
      "Refusing to run tests: DATABASE_URL in .env.test is the same database as .env. " +
        "Tests wipe every table — point .env.test at a separate test database."
    );
  }
}
