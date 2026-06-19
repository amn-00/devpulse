"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboard, resolveBlocker } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Dashboard } from "@/types";

function BlockerCard({ blocker, onResolve }: {
  blocker: Dashboard["activeBlockers"][0];
  onResolve: (id: number) => void;
}) {
  return (
    <div className={`rounded-xl border p-4 ${
      blocker.isFlagged
        ? "bg-red-950/30 border-red-700"
        : "bg-amber-950/20 border-amber-800"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-200">{blocker.userName}</span>
            {blocker.isFlagged && (
              <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-2 py-0.5 rounded-full">
                🚨 Flagged — {blocker.hoursOpen}h open
              </span>
            )}
            {!blocker.isFlagged && (
              <span className="text-xs text-amber-400">{blocker.hoursOpen}h open</span>
            )}
          </div>
          <p className="text-sm text-gray-300">{blocker.description}</p>
        </div>
        <button
          onClick={() => onResolve(blocker.id)}
          className="shrink-0 text-xs bg-green-900/40 hover:bg-green-800/60 border border-green-700 text-green-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          ✓ Resolve
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
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
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "manager") { router.replace("/standup"); return; }
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [user, router, fetchDashboard]);

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
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">⚡ DevPulse</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">👤 {user?.name} · Manager</span>
          <button onClick={() => router.push("/standup")} className="btn-secondary text-sm py-1">
            My Standup
          </button>
          <button onClick={() => { logout(); router.replace("/login"); }}
            className="text-sm text-gray-500 hover:text-gray-300">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Team Dashboard</h2>
            <p className="text-gray-400 mt-1">
              Today's standup health — {new Date().toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
          </div>
          {dashboard && (
            <div className="text-right text-xs text-gray-500">
              {dashboard.cached ? "⚡ Cached" : "🔄 Live"} · Updated{" "}
              {new Date(dashboard.generatedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500">Loading dashboard...</div>
        )}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {dashboard && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-3xl font-bold text-indigo-400">
                  {postedCount}/{totalCount}
                </div>
                <div className="text-sm text-gray-400 mt-1">Posted today</div>
              </div>
              <div className="card text-center">
                <div className={`text-3xl font-bold ${
                  dashboard.activeBlockers.length > 0 ? "text-amber-400" : "text-green-400"
                }`}>
                  {dashboard.activeBlockers.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Active blockers</div>
              </div>
              <div className="card text-center">
                <div className={`text-3xl font-bold ${
                  dashboard.flaggedBlockerCount > 0 ? "text-red-400" : "text-green-400"
                }`}>
                  {dashboard.flaggedBlockerCount}
                </div>
                <div className="text-sm text-gray-400 mt-1">Flagged (&gt;24h)</div>
              </div>
            </div>

            {/* Team members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dashboard.teamMembers.map((member) => (
                  <div key={member.id} className={`card flex items-center gap-3 ${
                    !member.postedToday ? "opacity-60" : ""
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      member.postedToday ? "bg-green-400" : "bg-gray-600"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        {member.postedToday ? "Posted ✓" : "Not posted yet"}
                        {" · "}{member.streakLast7Days}/7 days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active blockers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Active Blockers
                {dashboard.flaggedBlockerCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-red-400">
                    {dashboard.flaggedBlockerCount} flagged
                  </span>
                )}
              </h3>
              {dashboard.activeBlockers.length === 0 ? (
                <div className="card text-center py-8 text-green-400">
                  🎉 No active blockers — team is unblocked!
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.activeBlockers.map((b) => (
                    <BlockerCard key={b.id} blocker={b} onResolve={handleResolve} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
