"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { demoLogin } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import {
  IconActivity, IconAlertCircle, IconAlertTriangle, IconArrowRight, IconDashboard,
  IconFlag, IconGithub, IconGlobe, IconSparkles, IconSpinner, IconUsers,
} from "@/components/icons";

const steps = [
  {
    num: "1",
    title: "Post your update",
    desc: "Each dev shares what they did, what's next, and any blockers — in under a minute, whenever it suits their timezone.",
  },
  {
    num: "2",
    title: "AI summarizes the day",
    desc: "DevPulse uses LLaMA to condense the whole team's updates into one crisp summary, with blockers surfaced first.",
  },
  {
    num: "3",
    title: "Everyone stays synced",
    desc: "Managers see progress and blockers at a glance on the dashboard. No meeting required.",
  },
];

const features = [
  {
    icon: IconSparkles,
    title: "AI-powered summaries",
    desc: "Groq-hosted LLaMA turns raw standup notes into clear daily digests for the whole team.",
  },
  {
    icon: IconAlertTriangle,
    title: "Blocker tracking",
    desc: "Blockers are flagged and surfaced to managers immediately — nothing gets buried in chat.",
  },
  {
    icon: IconDashboard,
    title: "Manager dashboard",
    desc: "One view of who posted, who's blocked, and how the team is trending day over day.",
  },
  {
    icon: IconGlobe,
    title: "Async-first",
    desc: "Built for remote teams across timezones. Kill the 9 AM standup call for good.",
  },
];

export default function Home() {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  // Logged-in users skip the landing page
  useEffect(() => {
    if (user) {
      router.replace(user.role === "manager" ? "/dashboard" : "/standup");
    }
  }, [user, router]);

  async function handleDemo() {
    setDemoError("");
    setDemoLoading(true);
    try {
      const res = await demoLogin();
      setAuth(res.data.token, res.data.user);
      router.replace("/dashboard");
    } catch {
      setDemoError("Demo is waking up — please try again in a few seconds.");
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-fg">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-solid text-white">
              <IconActivity className="h-4 w-4" />
            </span>
            DevPulse
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost px-2.5 sm:px-3.5">
              Sign in
            </Link>
            <Link href="/create-team" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.18),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <span className="badge-neutral mb-6 px-3 py-1">
              <IconSparkles className="h-3.5 w-3.5 text-primary-fg" />
              AI standup summaries, powered by Groq
            </span>
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] text-fg [text-wrap:balance] sm:text-5xl lg:text-6xl">
              Async standups for dev teams.
              <span className="mt-2 block text-primary-fg">No meetings. No chaos.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
              DevPulse collects your team&apos;s daily updates asynchronously and uses AI to
              summarize progress and surface blockers — so everyone stays in sync without
              another call on the calendar.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                aria-busy={demoLoading}
                className="btn-primary btn-lg w-full sm:w-auto"
              >
                {demoLoading
                  ? <IconSpinner className="h-4 w-4 animate-spin" />
                  : <IconSparkles className="h-4 w-4" />}
                {demoLoading ? "Loading demo..." : "View live demo"}
              </button>
              <Link href="/create-team" className="btn-secondary btn-lg w-full sm:w-auto">
                Create your team
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-fg-subtle">
              No signup needed — explore a real team&apos;s dashboard instantly.
            </p>
            {demoError && (
              <p role="alert" className="mt-3 inline-flex items-center gap-1.5 text-sm text-danger">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {demoError}
              </p>
            )}

            {/* Product preview (decorative illustration) */}
            <div aria-hidden="true" className="mx-auto mt-14 max-w-4xl select-none text-left sm:mt-20">
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  <span className="ml-3 truncate font-mono text-xs text-fg-subtle">devpulse / dashboard</span>
                </div>
                <div className="space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="panel p-3 sm:p-4">
                      <div className="flex items-center justify-between text-xs text-fg-muted">
                        Posted<IconUsers className="hidden h-3.5 w-3.5 sm:block" />
                      </div>
                      <div className="mt-2 font-mono text-xl font-semibold text-fg sm:text-2xl">
                        5<span className="text-fg-subtle">/6</span>
                      </div>
                    </div>
                    <div className="panel p-3 sm:p-4">
                      <div className="flex items-center justify-between text-xs text-fg-muted">
                        Blockers<IconAlertTriangle className="hidden h-3.5 w-3.5 sm:block" />
                      </div>
                      <div className="mt-2 font-mono text-xl font-semibold text-warning sm:text-2xl">2</div>
                    </div>
                    <div className="panel p-3 sm:p-4">
                      <div className="flex items-center justify-between text-xs text-fg-muted">
                        Flagged<IconFlag className="hidden h-3.5 w-3.5 sm:block" />
                      </div>
                      <div className="mt-2 font-mono text-xl font-semibold text-success sm:text-2xl">0</div>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <IconSparkles className="h-4 w-4 text-primary-fg" />
                      <span className="text-sm font-semibold text-fg">AI Standup Summary</span>
                      <span className="badge-success sm:ml-auto">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />Team Health: Green
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-full rounded bg-surface-2" />
                      <div className="h-2.5 w-11/12 rounded bg-surface-2" />
                      <div className="h-2.5 w-3/5 rounded bg-surface-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works + features */}
        <section aria-labelledby="how-heading" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-primary-fg">Workflow</p>
            <h2 id="how-heading" className="mt-3 text-3xl font-semibold text-fg">How it works</h2>

            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((s) => (
                <li key={s.num} className="relative border-t border-border pt-6">
                  <span aria-hidden="true" className="absolute -top-px left-0 h-px w-12 bg-primary" />
                  <span className="font-mono text-sm text-primary-fg">0{s.num}</span>
                  <h3 className="mt-2 text-base font-semibold text-fg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.desc}</p>
                </li>
              ))}
            </ol>

            <h3 className="mt-20 text-xl font-semibold text-fg sm:mt-24">
              Everything a remote team needs
            </h3>
            <div className="mt-8 grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="bg-surface p-6 sm:p-8">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-fg">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <h4 className="mt-4 font-semibold text-fg">{f.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-fg-subtle sm:flex-row sm:px-6">
          <span className="text-center sm:text-left">
            Built with Next.js 16 · Express · PostgreSQL · Redis · Groq LLaMA
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/amn-00/devpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
            >
              <IconGithub className="h-4 w-4" />
              GitHub
            </a>
            <span>© {new Date().getFullYear()} DevPulse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
