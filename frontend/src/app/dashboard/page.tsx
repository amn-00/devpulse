"use client";
import AISummary from "@/components/AISummary";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboard, resolveBlocker } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Dashboard } from "@/types";
import {
  IconActivity, IconAlertCircle, IconAlertTriangle, IconCheck, IconCircleCheck,
  IconClock, IconFlag, IconLogOut, IconPen, IconUser, IconUsers, IconZap,
} from "@/components/icons";

function BlockerCard({ blocker, onResolve }: {
  blocker: Dashboard["activeBlockers"][0];
  onResolve: (id: number) => void;
}) {
  return (
    <div className={`card flex flex-col gap-4 border-l-2 sm:flex-row sm:items-start sm:justify-between ${
      blocker.isFlagged ? "border-l-danger" : "border-l-warning"
    }`}>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-fg">{blocker.userName}</span>
          {blocker.isFlagged && (
            <span className="badge-danger">
              <IconFlag className="h-3 w-3" />
              <span>Flagged · {blocker.hoursOpen}h open</span>
            </span>
          )}
          {!blocker.isFlagged && (
            <span className="badge-warning">
              <IconClock className="h-3 w-3" />
              <span>{blocker.hoursOpen}h open</span>
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{blocker.description}</p>
      </div>
      <button
        onClick={() => onResolve(blocker.id)}
        className="btn-secondary shrink-0 self-start"
      >
        <IconCheck className="h-4 w-4 text-success" />
        Resolve
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await getDashboard();
      setDashboard(res.data);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return; // wait for the stored session before redirecting
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "manager") { router.replace("/standup"); return; }
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [ready, user, router, fetchDashboard]);

  async function handleResolve(id: number) {
    try {
      await resolveBlocker(id);
      await fetchDashboard();
    } catch {
      alert("Failed to resolve blocker");
    }
  }

  const postedCount = dashboard?.teamMembers.filter((m) => m.postedToday).length ?? 0;
  const totalCount = dashboard?.teamMembers.length ?? 0;

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
              <div className="leading-tight">
                <p className="text-sm font-medium text-fg">{user?.name}</p>
                <p className="text-xs text-fg-subtle">Manager</p>
              </div>
            </div>
            <button onClick={() => router.push("/standup")} className="btn-secondary">
              <IconPen className="h-4 w-4" />
              My Standup
            </button>
            <ThemeToggle />
            <button onClick={() => { logout(); router.replace("/login"); }}
              className="btn-ghost px-2.5 sm:px-3.5" aria-label="Sign out">
              <IconLogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-fg">Team Dashboard</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Today's standup health — {new Date().toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
          </div>
          {dashboard && (
            <div className="flex items-center gap-2 text-xs text-fg-subtle">
              {dashboard.cached ? (
                <span className="badge-neutral"><IconZap className="h-3 w-3" />Cached</span>
              ) : (
                <span className="badge-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />Live
                </span>
              )}
              <span>
                Updated{" "}
                <span className="font-mono tabular-nums">
                  {new Date(dashboard.generatedAt).toLocaleTimeString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div role="status" className="space-y-10">
            <span className="sr-only">Loading dashboard...</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card space-y-4">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-8 w-16" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card flex items-center gap-3">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div role="alert" className="alert-error">
            <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {dashboard && (
          <div className="space-y-10">
            {/* Summary cards */}
            <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="card">
                <div className="flex items-center justify-between text-sm text-fg-muted">
                  <span>Posted today</span>
                  <IconUsers className="h-4 w-4 text-fg-subtle" />
                </div>
                <div className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight text-fg">
                  {postedCount}<span className="text-fg-subtle">/{totalCount}</span>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between text-sm text-fg-muted">
                  <span>Active blockers</span>
                  <IconAlertTriangle className="h-4 w-4 text-fg-subtle" />
                </div>
                <div className={`mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight ${
                  dashboard.activeBlockers.length > 0 ? "text-warning" : "text-success"
                }`}>
                  {dashboard.activeBlockers.length}
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between text-sm text-fg-muted">
                  <span>Flagged (&gt;24h)</span>
                  <IconFlag className="h-4 w-4 text-fg-subtle" />
                </div>
                <div className={`mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight ${
                  dashboard.flaggedBlockerCount > 0 ? "text-danger" : "text-success"
                }`}>
                  {dashboard.flaggedBlockerCount}
                </div>
              </div>
            </section>

            {/* Team members */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3 className="section-title">Team Members</h3>
                <span className="text-xs tabular-nums text-fg-subtle">
                  {postedCount} of {totalCount} posted
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboard.teamMembers.map((member) => (
                  <li key={member.id} className="card flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                      member.postedToday
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-surface-2 text-fg-subtle"
                    }`}>
                      {member.postedToday ? <IconCheck className="h-4 w-4" /> : <IconClock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg" title={member.name}>{member.name}</p>
                      <p className="text-xs text-fg-subtle">
                        {member.postedToday ? "Posted" : "Not posted yet"}
                        {" · "}<span className="tabular-nums">{member.streakLast7Days}/7 days</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Active blockers */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h3 className="section-title">Active Blockers</h3>
                {dashboard.flaggedBlockerCount > 0 && (
                  <span className="badge-danger">
                    {dashboard.flaggedBlockerCount} flagged
                  </span>
                )}
              </div>
              {dashboard.activeBlockers.length === 0 ? (
                <div className="card flex flex-col items-center gap-2 py-10 text-center">
                  <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                    <IconCircleCheck className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-fg">No active blockers</p>
                  <p className="text-sm text-fg-muted">Team is unblocked.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.activeBlockers.map((b) => (
                    <BlockerCard key={b.id} blocker={b} onResolve={handleResolve} />
                  ))}
                </div>
              )}
            </section>

            {/* AI Standup Summary */}
            <section className="card">
              <AISummary />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
