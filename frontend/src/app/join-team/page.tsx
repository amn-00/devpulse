"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinTeam } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function JoinTeamPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ inviteCode: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await joinTeam(form);
      setAuth(res.data.token, res.data.user);
      router.replace("/standup");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to join team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">⚡ DevPulse</h1>
          <p className="text-gray-400 mt-2">Join your team</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Join an existing team</h2>
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Invite Code</label>
              <input className="input uppercase tracking-widest" name="inviteCode"
                value={form.inviteCode} onChange={handleChange}
                required placeholder="e.g. A1B2C3D4" maxLength={8} />
              <p className="text-xs text-gray-500 mt-1">Get this from your team manager</p>
            </div>
            <div>
              <label className="label">Your Name</label>
              <input className="input" name="name" value={form.name}
                onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="Min 6 characters" />
            </div>
            <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? "Joining..." : "Join Team"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
          {" · "}
          <Link href="/create-team" className="text-indigo-400 hover:underline">Create a team</Link>
        </p>
      </div>
    </div>
  );
}
