"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinTeam } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { IconActivity, IconAlertCircle, IconKey, IconSpinner } from "@/components/icons";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.15),transparent_70%)]" />
      <ThemeToggle className="absolute right-4 top-4" />

      <main id="main" className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-solid text-white">
            <IconActivity className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">DevPulse</h1>
          <p className="mt-1.5 text-sm text-fg-muted">Join your team</p>
        </div>
        <div className="card sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-fg">Join an existing team</h2>
          {error && (
            <div role="alert" className="alert-error mb-4">
              <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="join-inviteCode" className="label">Invite Code</label>
              <div className="relative">
                <IconKey className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input id="join-inviteCode" className="input pl-9 font-mono uppercase tracking-[0.3em]" name="inviteCode"
                  aria-describedby="join-inviteCode-hint" autoComplete="off" spellCheck={false}
                  value={form.inviteCode} onChange={handleChange}
                  required placeholder="e.g. A1B2C3D4" maxLength={8} />
              </div>
              <p id="join-inviteCode-hint" className="hint">Get this from your team manager</p>
            </div>
            <div>
              <label htmlFor="join-name" className="label">Your Name</label>
              <input id="join-name" className="input" name="name" autoComplete="name" value={form.name}
                onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div>
              <label htmlFor="join-email" className="label">Email</label>
              <input id="join-email" className="input" type="email" name="email" autoComplete="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="join-password" className="label">Password</label>
              <input id="join-password" className="input" type="password" name="password" autoComplete="new-password" value={form.password}
                onChange={handleChange} required placeholder="Min 6 characters" />
            </div>
            <button className="btn-primary mt-2 h-10 w-full" type="submit" disabled={loading} aria-busy={loading}>
              {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
              {loading ? "Joining..." : "Join Team"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-fg-muted">
          <Link href="/login" className="font-medium text-primary-fg hover:underline">Sign in</Link>
          <span aria-hidden="true" className="text-fg-subtle">{" · "}</span>
          <Link href="/create-team" className="font-medium text-primary-fg hover:underline">Create a team</Link>
        </p>
      </main>
    </div>
  );
}
