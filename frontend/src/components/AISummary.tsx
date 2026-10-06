"use client";
import { useState } from "react";
import axios from "axios";
import {
  IconAlertCircle, IconAlertTriangle, IconCheck, IconCircleCheck, IconSparkles,
  IconSpinner, IconTarget,
} from "@/components/icons";

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
  Green: "text-success bg-success/10 border-success/30",
  Yellow: "text-warning bg-warning/10 border-warning/30",
  Red: "text-danger bg-danger/10 border-danger/30",
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
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-fg">
            <IconSparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="section-title">AI Standup Summary</h3>
            <p className="mt-0.5 text-xs text-fg-subtle">
              Powered by Groq · Prompt engineered for structured output
            </p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          aria-busy={loading}
          className="btn-primary self-start"
        >
          {loading
            ? <IconSpinner className="h-4 w-4 animate-spin" />
            : <IconSparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {error && (
        <div role="alert" className="alert-error">
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div role="status" className="panel space-y-3">
          <p className="flex items-center gap-2 text-sm text-fg-muted">
            <IconSpinner className="h-4 w-4 animate-spin text-primary-fg" />
            Analysing standup entries with LLaMA...
          </p>
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Team health badge */}
          <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-sm ${HEALTH_COLORS[result.summary.team_health]}`}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
            <span className="font-medium">Team Health: {result.summary.team_health}</span>
            <span className="text-fg-muted">— {result.summary.team_health_reason}</span>
          </div>

          {/* Summary */}
          <div className="panel">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-subtle">Overview</p>
            <p className="text-sm leading-relaxed text-fg">{result.summary.summary}</p>
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="panel">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success">
                <IconCircleCheck className="h-3.5 w-3.5" />Achievements
              </p>
              {result.summary.achievements.length > 0 ? (
                <ul className="space-y-2">
                  {result.summary.achievements.map((a, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />{a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-subtle">None reported</p>
              )}
            </div>

            <div className="panel">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
                <IconAlertTriangle className="h-3.5 w-3.5" />Active Blockers
              </p>
              {result.summary.active_blockers.length > 0 ? (
                <ul className="space-y-2">
                  {result.summary.active_blockers.map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />{b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-1.5 text-sm text-success">
                  <IconCheck className="h-4 w-4" />No blockers
                </p>
              )}
            </div>

            <div className="panel">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-fg">
                <IconTarget className="h-3.5 w-3.5" />Today's Priorities
              </p>
              {result.summary.priorities_today.length > 0 ? (
                <ul className="space-y-2">
                  {result.summary.priorities_today.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{p}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-subtle">None specified</p>
              )}
            </div>
          </div>

          {/* Meta */}
          <p className="text-right font-mono text-xs text-fg-subtle">
            Generated by {result.model} · {result.entries_count} entries analysed ·{" "}
            {new Date(result.generated_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
