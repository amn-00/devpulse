/**
 * AI Standup Summary Generator
 * Uses OpenAI GPT to summarise today's team standup entries
 * into a structured daily report for managers.
 *
 * Demonstrates: LLM API integration + Prompt Engineering
 */

const pool = require("../config/db");

/**
 * Engineered prompt that instructs GPT to produce
 * a structured JSON summary — not free-form text.
 * This is what "prompt engineering" means in practice.
 */
function buildPrompt(entries) {
  const entriesText = entries
    .map(
      (e, i) =>
        `Team member ${i + 1} (${e.name}):\n` +
        `  Yesterday: ${e.yesterday}\n` +
        `  Today: ${e.today}\n` +
        `  Blocker: ${e.blocker || "None"}`
    )
    .join("\n\n");

  return `You are a technical team lead summarising daily standups for a software engineering team.

Here are today's standup entries:

${entriesText}

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
- team_health is Green if no blockers, Yellow if blockers exist, Red if critical blockers >24h
- achievements should highlight completed work
- priorities_today should be concrete tasks for today
- active_blockers should be empty array [] if none exist`;
}

/** POST /api/summary — generate AI summary of today's standups */
async function generateSummary(req, res) {
  const { teamId } = req.user;

  try {
    // 1. Fetch today's standup entries with blocker info
    const result = await pool.query(
      `SELECT 
         u.name,
         se.yesterday,
         se.today,
         se.has_blocker,
         b.description AS blocker
       FROM standup_entries se
       JOIN users u ON u.id = se.user_id
       LEFT JOIN blockers b ON b.entry_id = se.id AND b.is_resolved = FALSE
       WHERE se.team_id = $1 AND se.entry_date = CURRENT_DATE
       ORDER BY se.created_at ASC`,
      [teamId]
    );

    const entries = result.rows;

    if (entries.length === 0) {
      return res.status(400).json({
        error: "No standup entries found for today. Ask your team to post their standups first.",
      });
    }

    // 2. Build engineered prompt
    const prompt = buildPrompt(entries);

    // 3. Call OpenAI API
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "OpenAI API key not configured. Add OPENAI_API_KEY to your environment variables.",
      });
    }

    const openaiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // lower = more consistent, structured output
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error("OpenAI error:", err);
      return res.status(502).json({ error: "Failed to generate summary from OpenAI" });
    }

    const data = await openaiRes.json();
    const rawContent = data.choices[0].message.content.trim();

    // 4. Parse JSON response safely
    let summary;
    try {
      summary = JSON.parse(rawContent);
    } catch {
      // If GPT wraps in markdown code fences, strip them
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      summary = JSON.parse(cleaned);
    }

    res.json({
      summary,
      entries_count: entries.length,
      generated_at: new Date().toISOString(),
      model: "llama-3.1-8b-instant",
      prompt_tokens: data.usage?.prompt_tokens,
      completion_tokens: data.usage?.completion_tokens,
    });
  } catch (err) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: "Failed to generate AI summary" });
  }
}

module.exports = { generateSummary };
