/**
 * AI Standup Summary Generator
 * Uses an LLM (openai/gpt-oss-20b, hosted on Groq) to summarise today's
 * team standup entries into a structured daily report for managers.
 *
 * Demonstrates: LLM API integration + Prompt Engineering
 */

const pool = require("../config/db");

const MODEL = "openai/gpt-oss-20b";
const BLOCKER_FLAG_HOURS = 24;

/**
 * Engineered prompt that instructs the model to produce
 * a structured JSON summary — not free-form text.
 * This is what "prompt engineering" means in practice.
 */
function buildPrompt(entries, blockers) {
  const entriesText = entries
    .map(
      (e, i) =>
        `Team member ${i + 1} (${e.name}):\n` +
        `  Yesterday: ${e.yesterday}\n` +
        `  Today: ${e.today}`
    )
    .join("\n\n");

  const blockersText = blockers.length
    ? blockers
        .map(
          (b) =>
            `- ${b.description} (${b.name}, open ${Math.round(b.hours_open)}h` +
            `${b.hours_open >= BLOCKER_FLAG_HOURS ? ", CRITICAL" : ""})`
        )
        .join("\n")
    : "None";

  return `You are a technical team lead summarising daily standups for a software engineering team.

Here are today's standup entries:

${entriesText}

Unresolved blockers across the team (with how long each has been open):

${blockersText}

Generate a concise, structured daily summary. Respond ONLY with valid JSON in this exact format:
{
  "summary": "2-3 sentence overview of what the team accomplished and is working on today",
  "achievements": ["achievement 1", "achievement 2"],
  "active_blockers": ["blocker 1 (person name)"],
  "priorities_today": ["priority 1", "priority 2"],
  "team_health": "Green | Yellow | Red",
  "team_health_reason": "one sentence explaining the health status"
}

Rules:
- Be concise and actionable
- team_health is Green if there are no unresolved blockers, Yellow if blockers exist but none are CRITICAL, Red if any blocker is marked CRITICAL (open ${BLOCKER_FLAG_HOURS}h or more)
- achievements should highlight completed work
- priorities_today should be concrete tasks for today
- active_blockers should be empty array [] if none exist`;
}

/** POST /api/summary — generate AI summary of today's standups */
async function generateSummary(req, res) {
  const { teamId } = req.user;

  try {
    // 1. Fetch today's standup entries
    const entriesResult = await pool.query(
      `SELECT u.name, se.yesterday, se.today
       FROM standup_entries se
       JOIN users u ON u.id = se.user_id
       WHERE se.team_id = $1 AND se.entry_date = CURRENT_DATE
       ORDER BY se.created_at ASC`,
      [teamId]
    );

    const entries = entriesResult.rows;

    if (entries.length === 0) {
      return res.status(400).json({
        error: "No standup entries found for today. Ask your team to post their standups first.",
      });
    }

    // 2. Fetch all unresolved blockers (including ones carried over from
    //    earlier days) with their age, so the model can judge severity
    const blockersResult = await pool.query(
      `SELECT b.description, u.name,
              EXTRACT(EPOCH FROM (NOW() - b.created_at)) / 3600 AS hours_open
       FROM blockers b
       JOIN users u ON u.id = b.user_id
       WHERE b.team_id = $1 AND b.is_resolved = FALSE
       ORDER BY b.created_at ASC`,
      [teamId]
    );
    const blockers = blockersResult.rows.map((b) => ({
      ...b,
      hours_open: parseFloat(b.hours_open),
    }));

    // 3. Build engineered prompt
    const prompt = buildPrompt(entries, blockers);

    // 4. Call Groq's OpenAI-compatible chat completions API
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Groq API key not configured. Add GROQ_API_KEY to your environment variables.",
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // lower = more consistent, structured output
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      console.error("Groq error:", err);
      return res.status(502).json({ error: "Failed to generate summary from Groq" });
    }

    const data = await groqRes.json();
    const rawContent = data.choices[0].message.content.trim();

    // 5. Parse JSON response safely
    let summary;
    try {
      summary = JSON.parse(rawContent);
    } catch {
      // If the model wraps its JSON in markdown code fences, strip them
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      summary = JSON.parse(cleaned);
    }

    res.json({
      summary,
      entries_count: entries.length,
      generated_at: new Date().toISOString(),
      model: MODEL,
      prompt_tokens: data.usage?.prompt_tokens,
      completion_tokens: data.usage?.completion_tokens,
    });
  } catch (err) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: "Failed to generate AI summary" });
  }
}

module.exports = { generateSummary };
