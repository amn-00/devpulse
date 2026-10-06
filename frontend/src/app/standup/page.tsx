"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitStandup, getMyEntries } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { StandupEntry } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";
import {
  IconActivity, IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconDashboard,
  IconFlag, IconLogOut, IconSpinner, IconTarget, IconUser,
} from "@/components/icons";

export default function StandupPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ yesterday: "", today: "", blockerDescription: "" });
  const [history, setHistory] = useState<StandupEntry[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    getMyEntries().then((res) => setHistory(res.data.entries)).catch(() => {});
  }, [user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!form.yesterday.trim() || !form.today.trim()) {
      setError("Both 'yesterday' and 'today' fields are required");
      return;
    }
    setLoading(true);
    try {
      await submitStandup({
        yesterday: form.yesterday,
        today: form.today,
        blockerDescription: form.blockerDescription || undefined,
      });
      setSuccess(true);
      setForm({ yesterday: "", today: "", blockerDescription: "" });
      const res = await getMyEntries();
      setHistory(res.data.entries);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit standup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav aria-label="Main" className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <h1 className="flex items-center gap-2.5 text-[15px] font-semibold text-fg">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-solid text-white">
              <IconActivity className="h-4 w-4" />
            </span>
            DevPulse
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="mr-1 hidden items-center gap-2.5 border-r border-border pr-3 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2 text-fg-muted">
                <IconUser className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-medium text-fg">{user?.name}</p>
            </div>
            {user?.role === "manager" && (
              <button onClick={() => router.push("/dashboard")} className="btn-secondary">
                <IconDashboard className="h-4 w-4" />
                Dashboard
              </button>
            )}
            <ThemeToggle />
            <button onClick={() => { logout(); router.replace("/login"); }}
              className="btn-ghost px-2.5 sm:px-3.5" aria-label="Sign out">
              <IconLogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="main" className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-2xl font-semibold text-fg">Daily Standup</h2>
        <p className="mt-1 mb-8 text-sm text-fg-muted">What did you work on? Any blockers?</p>

        {success && (
          <div role="status" className="alert-success mb-6">
            <IconCircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Standup submitted successfully!</span>
          </div>
        )}
        {error && (
          <div role="alert" className="alert-error mb-6">
            <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="card mb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="standup-yesterday" className="label flex items-center gap-2">
                <IconCircleCheck className="h-4 w-4 text-success" />
                Yesterday — What did you complete?
              </label>
              <textarea id="standup-yesterday" className="input min-h-[88px] resize-y"
                value={form.yesterday}
                onChange={(e) => setForm((p) => ({ ...p, yesterday: e.target.value }))}
                placeholder="Finished the auth API, reviewed PR #42..." required />
            </div>
            <div>
              <label htmlFor="standup-today" className="label flex items-center gap-2">
                <IconTarget className="h-4 w-4 text-primary-fg" />
                Today — What are you working on?
              </label>
              <textarea id="standup-today" className="input min-h-[88px] resize-y"
                value={form.today}
                onChange={(e) => setForm((p) => ({ ...p, today: e.target.value }))}
                placeholder="Building the dashboard UI, writing Jest tests..." required />
            </div>
            <div>
              <label htmlFor="standup-blocker" className="label flex items-center gap-2">
                <IconAlertTriangle className="h-4 w-4 text-warning" />
                Blocker <span className="font-normal text-fg-subtle">(optional)</span>
              </label>
              <textarea id="standup-blocker" className="input min-h-[64px] resize-y"
                aria-describedby="standup-blocker-hint"
                value={form.blockerDescription}
                onChange={(e) => setForm((p) => ({ ...p, blockerDescription: e.target.value }))}
                placeholder="Leave blank if no blocker — or describe what's blocking you..." />
              {form.blockerDescription && (
                <p id="standup-blocker-hint" className="mt-1.5 flex items-start gap-1.5 text-xs text-warning">
                  <IconFlag className="mt-px h-3.5 w-3.5 shrink-0" />
                  This blocker will be flagged on the manager dashboard after 24 hours if unresolved
                </p>
              )}
            </div>
            <button className="btn-primary h-10 w-full" type="submit" disabled={loading} aria-busy={loading}>
              {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Standup"}
            </button>
          </form>
        </div>

        {/* History */}
        {history.length > 0 && (
          <section>
            <h3 className="section-title mb-5">Your recent standups</h3>
            <ol className="relative space-y-6 border-l border-border pl-6">
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-bg ${
                      entry.has_blocker ? "bg-warning" : "bg-primary"
                    }`}
                  />
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <time className="font-mono text-xs text-fg-muted">
                      {new Date(entry.entry_date).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                      })}
                    </time>
                    {entry.has_blocker && (
                      <span className="badge-warning">
                        <IconAlertTriangle className="h-3 w-3" />
                        Had blocker
                      </span>
                    )}
                  </div>
                  <div className="card space-y-2 text-sm leading-relaxed">
                    <p className="text-fg [overflow-wrap:anywhere]">
                      <span className="mr-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">Yesterday</span>
                      {entry.yesterday}
                    </p>
                    <p className="text-fg [overflow-wrap:anywhere]">
                      <span className="mr-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">Today</span>
                      {entry.today}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
