const pool = require("../config/db");
const redis = require("../config/redis");

const BLOCKER_FLAG_HOURS = 24;
const DASHBOARD_CACHE_TTL_SECONDS = 300; // 5 minutes
const dashboardCacheKey = (teamId) => `dashboard:team:${teamId}`;

/** POST /api/standup — submit today's standup entry */
async function createEntry(req, res) {
  const { yesterday, today, blockerDescription } = req.body;
  const { userId, teamId } = req.user;

  if (!yesterday || !today) {
    return res.status(400).json({ error: "Both 'yesterday' and 'today' fields are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hasBlocker = Boolean(blockerDescription && blockerDescription.trim());

    const entryResult = await client.query(
      `INSERT INTO standup_entries (user_id, team_id, yesterday, today, has_blocker)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET yesterday = $3, today = $4, has_blocker = $5
       RETURNING *`,
      [userId, teamId, yesterday, today, hasBlocker]
    );
    const entry = entryResult.rows[0];

    if (hasBlocker) {
      await client.query(
        `INSERT INTO blockers (entry_id, user_id, team_id, description)
         VALUES ($1, $2, $3, $4)`,
        [entry.id, userId, teamId, blockerDescription.trim()]
      );
    }

    await client.query("COMMIT");

    // Invalidate dashboard cache since team data changed
    await redis.del(dashboardCacheKey(teamId));

    res.status(201).json({ entry });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to submit standup entry" });
  } finally {
    client.release();
  }
}

/** GET /api/standup/mine — get my own entry history */
async function getMyEntries(req, res) {
  const { userId } = req.user;
  try {
    const result = await pool.query(
      `SELECT se.*, 
              array_agg(b.description) FILTER (WHERE b.id IS NOT NULL) AS blocker_descriptions
       FROM standup_entries se
       LEFT JOIN blockers b ON b.entry_id = se.id
       WHERE se.user_id = $1
       GROUP BY se.id
       ORDER BY se.entry_date DESC
       LIMIT 30`,
      [userId]
    );
    res.json({ entries: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
}

/**
 * GET /api/dashboard — team health dashboard (manager view)
 * Cached in Redis for DASHBOARD_CACHE_TTL_SECONDS since this is an
 * expensive aggregation query run frequently by managers.
 */
async function getDashboard(req, res) {
  const { teamId } = req.user;
  const cacheKey = dashboardCacheKey(teamId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ ...JSON.parse(cached), cached: true });
    }

    // Who posted today
    const postedTodayResult = await pool.query(
      `SELECT u.id, u.name, se.created_at
       FROM users u
       LEFT JOIN standup_entries se 
         ON se.user_id = u.id AND se.entry_date = CURRENT_DATE
       WHERE u.team_id = $1
       ORDER BY u.name`,
      [teamId]
    );

    // Active (unresolved) blockers, auto-flagged if older than threshold
    const blockersResult = await pool.query(
      `SELECT b.id, b.description, b.created_at, u.name AS user_name,
              EXTRACT(EPOCH FROM (NOW() - b.created_at)) / 3600 AS hours_open,
              (EXTRACT(EPOCH FROM (NOW() - b.created_at)) / 3600 >= $2) AS is_flagged
       FROM blockers b
       JOIN users u ON u.id = b.user_id
       WHERE b.team_id = $1 AND b.is_resolved = FALSE
       ORDER BY b.created_at ASC`,
      [teamId, BLOCKER_FLAG_HOURS]
    );

    // Posting streak per user (consecutive days including today, simplified)
    const streakResult = await pool.query(
      `SELECT user_id, COUNT(*) AS streak_days
       FROM standup_entries
       WHERE team_id = $1 AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY user_id`,
      [teamId]
    );
    const streakMap = Object.fromEntries(
      streakResult.rows.map((r) => [r.user_id, parseInt(r.streak_days, 10)])
    );

    const dashboard = {
      teamMembers: postedTodayResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        postedToday: row.created_at !== null,
        streakLast7Days: streakMap[row.id] || 0,
      })),
      activeBlockers: blockersResult.rows.map((b) => ({
        id: b.id,
        description: b.description,
        userName: b.user_name,
        hoursOpen: Math.round(parseFloat(b.hours_open) * 10) / 10,
        isFlagged: b.is_flagged,
      })),
      flaggedBlockerCount: blockersResult.rows.filter((b) => b.is_flagged).length,
      generatedAt: new Date().toISOString(),
    };

    await redis.setex(cacheKey, DASHBOARD_CACHE_TTL_SECONDS, JSON.stringify(dashboard));

    res.json({ ...dashboard, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
}

/** PATCH /api/blockers/:id/resolve — mark a blocker as resolved */
async function resolveBlocker(req, res) {
  const { id } = req.params;
  const { teamId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE blockers SET is_resolved = TRUE, resolved_at = NOW()
       WHERE id = $1 AND team_id = $2 RETURNING *`,
      [id, teamId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blocker not found" });
    }

    await redis.del(dashboardCacheKey(teamId));

    res.json({ blocker: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resolve blocker" });
  }
}

module.exports = { createEntry, getMyEntries, getDashboard, resolveBlocker };
