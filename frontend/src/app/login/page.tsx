"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { IconActivity, IconAlertCircle, IconSpinner } from "@/components/icons";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.15),transparent_70%)]" />
      <ThemeToggle className="absolute right-4 top-4" />

      <main id="main" className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-solid text-white">
            <IconActivity className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">DevPulse</h1>
          <p className="mt-1.5 text-sm text-fg-muted">Team standup tracker for remote engineering teams</p>
        </div>

        <div className="card sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-fg">Sign in</h2>
          {error && (
            <div role="alert" className="alert-error mb-4">
              <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <input id="login-email" className="input" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <input id="login-password" className="input" type="password" autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button className="btn-primary mt-2 h-10 w-full" type="submit" disabled={loading} aria-busy={loading}>
              {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-fg-muted">
          <Link href="/create-team" className="font-medium text-primary-fg hover:underline">Create a new team</Link>
          <span aria-hidden="true" className="text-fg-subtle">·</span>
          <Link href="/join-team" className="font-medium text-primary-fg hover:underline">Join an existing team</Link>
        </p>
      </main>
    </div>
  );
}
