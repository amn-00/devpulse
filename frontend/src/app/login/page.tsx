"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.data.token, res.data.user);
      router.replace(res.data.user.role === "manager" ? "/dashboard" : "/standup");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">⚡ DevPulse</h1>
          <p className="text-gray-400 mt-2">Team standup tracker for remote engineering teams</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Sign in</h2>
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
          <div><Link href="/create-team" className="text-indigo-400 hover:underline">Create a new team</Link></div>
          <div><Link href="/join-team" className="text-indigo-400 hover:underline">Join an existing team</Link></div>
        </div>
      </div>
    </div>
  );
}
