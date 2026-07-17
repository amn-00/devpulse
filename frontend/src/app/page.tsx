"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { demoLogin } from "@/lib/api";

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
    icon: "🤖",
    title: "AI-powered summaries",
    desc: "Groq-hosted LLaMA turns raw standup notes into clear daily digests for the whole team.",
  },
  {
    icon: "🚧",
    title: "Blocker tracking",
    desc: "Blockers are flagged and surfaced to managers immediately — nothing gets buried in chat.",
  },
  {
    icon: "📊",
    title: "Manager dashboard",
    desc: "One view of who posted, who's blocked, and how the team is trending day over day.",
  },
  {
    icon: "🌏",
    title: "Async-first",
    desc: "Built for remote teams across timezones. Kill the 9 AM standup call for good.",
  },
];

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
    icon: "🤖",
    title: "AI-powered summaries",
    desc: "Groq-hosted LLaMA turns raw standup notes into clear daily digests for the whole team.",
  },
  {
    icon: "🚧",
    title: "Blocker tracking",
    desc: "Blockers are flagged and surfaced to managers immediately — nothing gets buried in chat.",
  },
  {
    icon: "📊",
    title: "Manager dashboard",
    desc: "One view of who posted, who's blocked, and how the team is trending day over day.",
  },
  {
    icon: "🌏",
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
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-indigo-400">⚡ DevPulse</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2">
            Sign in
          </Link>
          <Link href="/create-team" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Async standups for dev teams.
          <span className="block text-indigo-400 mt-2">No meetings. No chaos.</span>
        </h1>
        <p className="text-gray-400 text-lg mt-6 max-w-xl mx-auto">
          DevPulse collects your team&apos;s daily updates asynchronously and uses AI to
          summarize progress and surface blockers — so everyone stays in sync without
          another call on the calendar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="btn-primary text-base px-6 py-3"
          >
            {demoLoading ? "Loading demo..." : "✨ View live demo"}
          </button>
          <Link href="/create-team" className="btn-secondary text-base px-6 py-3">
            Create your team →
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-3">
          No signup needed — explore a real team&apos;s dashboard instantly.
        </p>
        {demoError && (
          <p className="text-red-400 text-sm mt-2">{demoError}</p>
        )}
      </section>

      {/* How it works */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="card">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center mb-4">
                {s.num}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10">
          Everything a remote team needs
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card flex gap-4">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>
            Built with Next.js 14 · Express · PostgreSQL · Redis · Groq LLaMA
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/amn-00/devpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              GitHub
            </a>
            <span>© {new Date().getFullYear()} DevPulse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
