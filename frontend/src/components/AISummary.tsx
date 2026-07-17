"use client";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SummaryData {
  summary: string;
  achievements: string[];
  active_blockers: string[];
  priorities_today: string[];
  team_health: "Green" | "Yellow" | "Red";
  team_health_reason: string;
}

interface SummaryResponse {
  summary: SummaryData;
  entries_count: number;
  generated_at: string;
  model: string;
}

const HEALTH_COLORS: Record<string, string> = {
  Green: "text-green-400 bg-green-900/30 border-green-700",
  Yellow: "text-yellow-400 bg-yellow-900/30 border-yellow-700",
  Red: "text-red-400 bg-red-900/30 border-red-700",
};

const HEALTH_EMOJI: Record<string, string> = {
  Green: "🟢",
  Yellow: "🟡",
  Red: "🔴",
};

export default function AISummary() {
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/summary`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">🤖 AI Standup Summary</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Powered by Groq LLaMA · Prompt engineered for structured output
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {loading ? "Generating..." : "✨ Generate Summary"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="card text-center py-8">
          <div className="text-gray-400 text-sm animate-pulse">
            🤖 Analysing standup entries with LLaMA...
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Team health badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${HEALTH_COLORS[result.summary.team_health]}`}>
            {HEALTH_EMOJI[result.summary.team_health]} Team Health: {result.summary.team_health}
            <span className="text-xs font-normal opacity-75">— {result.summary.team_health_reason}</span>
          </div>

          {/* Summary */}
          <div className="card">
            <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide text-xs">Overview</p>
            <p className="text-gray-200 text-sm leading-relaxed">{result.summary.summary}</p>
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-3">✅ Achievements</p>
              {result.summary.achievements.length > 0 ? (
                <ul className="space-y-1.5">
                  {result.summary.achievements.map((a, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-green-500 shrink-0">·</span>{a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">None reported</p>
              )}
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">🚧 Active Blockers</p>
              {result.summary.active_blockers.length > 0 ? (
                <ul className="space-y-1.5">
                  {result.summary.active_blockers.map((b, i) => (
                    <li key={i} className="text-sm text-amber-300 flex gap-2">
                      <span className="shrink-0">·</span>{b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-400">🎉 No blockers!</p>
              )}
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">🎯 Today's Priorities</p>
              {result.summary.priorities_today.length > 0 ? (
                <ul className="space-y-1.5">
                  {result.summary.priorities_today.map((p, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-indigo-400 shrink-0">·</span>{p}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">None specified</p>
              )}
            </div>
          </div>

          {/* Meta */}
          <p className="text-xs text-gray-600 text-right">
            Generated by {result.model} · {result.entries_count} entries analysed ·{" "}
            {new Date(result.generated_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
