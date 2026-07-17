/**
 * Demo data seeder — creates/refreshes the public demo team.
 *
 * Called lazily by POST /api/auth/demo, so demo data is always fresh:
 * every time a visitor opens the demo, missing entries for today and
 * recent days are topped up automatically (idempotent via ON CONFLICT).
 *
 * Can also be run standalone: node src/config/demoSeed.js
 */
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("./db");

const DEMO_MANAGER_EMAIL = "demo@devpulse.app";
const DEMO_TEAM_NAME = "Nimbus Labs (Demo)";
const DEMO_INVITE_CODE = "DEMO2026";

// Demo teammates (members post standups; manager views the dashboard)
const MEMBERS = [
  { name: "Priya Sharma", email: "priya.demo@devpulse.app" },
  { name: "Rahul Verma", email: "rahul.demo@devpulse.app" },
  { name: "Sneha Iyer", email: "sneha.demo@devpulse.app" },
  { name: "Arjun Mehta", email: "arjun.demo@devpulse.app" },
];

// 5 days of realistic updates per member. Index [memberIdx][dayOffset]
// dayOffset 0 = today, 1 = yesterday, etc.
// blocker: set only where a blocker should exist for that entry.
const UPDATES = [
  [
    { y: "Finished the payments webhook handler and added signature verification", t: "Start retry logic with exponential backoff for failed webhook deliveries", blocker: "Waiting on staging DB credentials from DevOps to test retries end-to-end" },
    { y: "Reviewed Rahul's PR on the orders service and fixed two race conditions", t: "Wire up the payments webhook handler", blocker: null },
    { y: "Wrote integration tests for the checkout flow", t: "Review open PRs and pick up the webhook task", blocker: null },
    { y: "Debugged the flaky CI pipeline — root cause was a shared test DB", t: "Isolate test DBs per CI job", blocker: null },
    { y: "Sprint planning and backlog grooming", t: "Investigate the flaky CI pipeline", blocker: null },
  ],
  [
    { y: "Shipped the orders service refactor behind a feature flag", t: "Roll the flag out to 25% of traffic and watch error rates", blocker: null },
    { y: "Addressed review comments on the orders refactor PR", t: "Merge and deploy behind a feature flag", blocker: null },
    { y: "Split the orders monolith handler into smaller modules", t: "Open the refactor PR for review", blocker: "Blocked on a design decision about idempotency keys — need 15 min with the team", resolvedDaysAgo: 1 },
    { y: "Profiled the orders endpoint — found N+1 queries", t: "Start the refactor to batch queries", blocker: null },
    { y: "On-call handover and incident writeup", t: "Profile the slow orders endpoint", blocker: null },
  ],
  [
    { y: "Finished dark mode for the settings page", t: "Start the notification preferences UI", blocker: null },
    { y: "Fixed mobile layout bugs on the dashboard", t: "Finish dark mode for settings", blocker: null },
    { y: "Built the reusable toggle component with keyboard support", t: "Apply it across the settings page", blocker: null },
    { y: "Accessibility audit of the dashboard — fixed focus traps", t: "Build a reusable toggle component", blocker: null },
    { y: "Design sync with Meera on the settings redesign", t: "Audit dashboard accessibility", blocker: null },
  ],
  [
    { y: "Cut Redis cache misses by 40% with smarter key TTLs", t: "Add cache-hit metrics to the Grafana dashboard", blocker: null },
    { y: "Instrumented the API gateway with request tracing", t: "Tune Redis TTLs based on trace data", blocker: null },
    { y: "Upgraded Postgres client and fixed connection pool leaks", t: "Add tracing to the API gateway", blocker: null },
    { y: "Load-tested the summary endpoint at 10x traffic", t: "Fix the connection pool leak the load test exposed", blocker: "Load test env keeps OOM-killing — need a bigger runner from infra", resolvedDaysAgo: 2 },
    { y: "Wrote the capacity planning doc for Q3", t: "Load-test the summary endpoint", blocker: null },
  ],
];

const DAYS_TO_SEED = 5;

/**
 * Ensures demo team, users, and entries exist. Idempotent.
 * @returns {Promise<object>} the demo manager user row (without password_hash)
 */
async function ensureDemoData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Team (invite code is stable, so ON CONFLICT makes this idempotent)
    const teamResult = await client.query(
      `INSERT INTO teams (name, invite_code) VALUES ($1, $2)
       ON CONFLICT (invite_code) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [DEMO_TEAM_NAME, DEMO_INVITE_CODE]
    );
    const team = teamResult.rows[0];

    // 2. Users — random password each seed; demo login only works via /api/auth/demo
    const randomHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);

    const managerResult = await client.query(
      `INSERT INTO users (name, email, password_hash, team_id, role)
       VALUES ($1, $2, $3, $4, 'manager')
       ON CONFLICT (email) DO UPDATE SET team_id = EXCLUDED.team_id, role = 'manager'
       RETURNING id, name, email, team_id, role`,
      ["Demo Manager", DEMO_MANAGER_EMAIL, randomHash, team.id]
    );
    const manager = managerResult.rows[0];

    const memberIds = [];
    for (const m of MEMBERS) {
      const r = await client.query(
        `INSERT INTO users (name, email, password_hash, team_id, role)
         VALUES ($1, $2, $3, $4, 'member')
         ON CONFLICT (email) DO UPDATE SET team_id = EXCLUDED.team_id
         RETURNING id`,
        [m.name, m.email, randomHash, team.id]
      );
      memberIds.push(r.rows[0].id);
    }

    // 3. Standup entries for today + past days (skipped if already present)
    for (let day = 0; day < DAYS_TO_SEED; day++) {
      for (let i = 0; i < memberIds.length; i++) {
        const u = UPDATES[i][day];
        const entryResult = await client.query(
          `INSERT INTO standup_entries (user_id, team_id, yesterday, today, has_blocker, entry_date)
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE - $6::int)
           ON CONFLICT (user_id, entry_date) DO NOTHING
           RETURNING id`,
          [memberIds[i], team.id, u.y, u.t, Boolean(u.blocker), day]
        );

        // Insert the blocker only when the entry was newly created
        if (u.blocker && entryResult.rows.length > 0) {
          const resolved = Number.isInteger(u.resolvedDaysAgo);
          await client.query(
            `INSERT INTO blockers (entry_id, user_id, team_id, description, is_resolved, created_at, resolved_at)
             VALUES ($1, $2, $3, $4, $5, NOW() - ($6::int * INTERVAL '1 day'),
                     CASE WHEN $5 THEN NOW() - ($7::int * INTERVAL '1 day') ELSE NULL END)`,
            [
              entryResult.rows[0].id,
              memberIds[i],
              team.id,
              u.blocker,
              resolved,
              day,
              resolved ? u.resolvedDaysAgo : 0,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
    return manager;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { ensureDemoData, DEMO_MANAGER_EMAIL };

// Allow standalone run: node src/config/demoSeed.js
if (require.main === module) {
  ensureDemoData()
    .then((m) => {
      console.log("✅ Demo data seeded. Manager:", m.email);
      return pool.end();
    })
    .catch((err) => {
      console.error("❌ Demo seed failed:", err.message);
      process.exit(1);
    });
}
