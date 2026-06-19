"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitStandup, getMyEntries } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { StandupEntry } from "@/types";

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
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">⚡ DevPulse</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">👤 {user?.name}</span>
          {user?.role === "manager" && (
            <button onClick={() => router.push("/dashboard")} className="btn-secondary text-sm py-1">
              Dashboard
            </button>
          )}
          <button onClick={() => { logout(); router.replace("/login"); }}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2">Daily Standup</h2>
        <p className="text-gray-400 mb-8">What did you work on? Any blockers?</p>

        {success && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-lg px-4 py-3 mb-6">
            ✅ Standup submitted successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="card mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">✅ Yesterday — What did you complete?</label>
              <textarea className="input min-h-[80px] resize-none"
                value={form.yesterday}
                onChange={(e) => setForm((p) => ({ ...p, yesterday: e.target.value }))}
                placeholder="Finished the auth API, reviewed PR #42..." required />
            </div>
            <div>
              <label className="label">🎯 Today — What are you working on?</label>
              <textarea className="input min-h-[80px] resize-none"
                value={form.today}
                onChange={(e) => setForm((p) => ({ ...p, today: e.target.value }))}
                placeholder="Building the dashboard UI, writing Jest tests..." required />
            </div>
            <div>
              <label className="label">
                🚧 Blocker <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea className="input min-h-[60px] resize-none"
                value={form.blockerDescription}
                onChange={(e) => setForm((p) => ({ ...p, blockerDescription: e.target.value }))}
                placeholder="Leave blank if no blocker — or describe what's blocking you..." />
              {form.blockerDescription && (
                <p className="text-xs text-amber-400 mt-1">
                  ⚠️ This blocker will be flagged on the manager dashboard after 24 hours if unresolved
                </p>
              )}
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Standup"}
            </button>
          </form>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Your recent standups</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {new Date(entry.entry_date).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                      })}
                    </span>
                    {entry.has_blocker && (
                      <span className="text-xs bg-amber-900/40 border border-amber-700 text-amber-300 px-2 py-0.5 rounded-full">
                        Had blocker
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300"><span className="text-gray-500">Yesterday:</span> {entry.yesterday}</p>
                  <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Today:</span> {entry.today}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
