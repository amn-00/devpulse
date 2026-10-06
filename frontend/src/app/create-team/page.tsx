"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTeam } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { IconActivity, IconAlertCircle, IconSpinner } from "@/components/icons";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.15),transparent_70%)]" />
      <ThemeToggle className="absolute right-4 top-4" />

      <main id="main" className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-solid text-white">
            <IconActivity className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">DevPulse</h1>
          <p className="mt-1.5 text-sm text-fg-muted">Create a new team</p>
        </div>
        <div className="card sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-fg">Set up your team</h2>
          {error && (
            <div role="alert" className="alert-error mb-4">
              <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="create-teamName" className="label">Team Name</label>
              <input id="create-teamName" className="input" name="teamName" autoComplete="organization" value={form.teamName}
                onChange={handleChange} required placeholder="Engineering Squad" />
            </div>
            <div>
              <label htmlFor="create-name" className="label">Your Name</label>
              <input id="create-name" className="input" name="name" autoComplete="name" value={form.name}
                onChange={handleChange} required placeholder="Aman Chaudhary" />
            </div>
            <div>
              <label htmlFor="create-email" className="label">Email</label>
              <input id="create-email" className="input" type="email" name="email" autoComplete="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="create-password" className="label">Password</label>
              <input id="create-password" className="input" type="password" name="password" autoComplete="new-password" value={form.password}
                onChange={handleChange} required placeholder="Min 6 characters" />
            </div>
            <button className="btn-primary mt-2 h-10 w-full" type="submit" disabled={loading} aria-busy={loading}>
              {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-fg-muted">
          Already have a team?{" "}
          <Link href="/login" className="font-medium text-primary-fg hover:underline">Sign in</Link>
          <span aria-hidden="true" className="text-fg-subtle">{" · "}</span>
          <Link href="/join-team" className="font-medium text-primary-fg hover:underline">Join a team</Link>
        </p>
      </main>
    </div>
  );
}
