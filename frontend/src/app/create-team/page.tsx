"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTeam } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function CreateTeamPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ teamName: "", name: "", email: "", password: "" });
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
      const res = await createTeam(form);
      setAuth(res.data.token, res.data.user);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">⚡ DevPulse</h1>
          <p className="text-gray-400 mt-2">Create a new team</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Set up your team</h2>
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Team Name</label>
              <input className="input" name="teamName" value={form.teamName}
                onChange={handleChange} required placeholder="Engineering Squad" />
            </div>
            <div>
              <label className="label">Your Name</label>
              <input className="input" name="name" value={form.name}
                onChange={handleChange} required placeholder="Aman Chaudhary" />
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
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have a team?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
          {" · "}
          <Link href="/join-team" className="text-indigo-400 hover:underline">Join a team</Link>
        </p>
      </div>
    </div>
  );
}
