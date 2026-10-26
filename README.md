# ⚡ DevPulse — Async Standup & Blocker Tracker

**Portfolio Project | Aman Chaudhary | Full-Stack Engineer**

![CI](https://github.com/amn-00/devpulse/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Express](https://img.shields.io/badge/Express.js-4.19-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-Upstash-red)
![Jest](https://img.shields.io/badge/Jest-29-orange)
![LLM](https://img.shields.io/badge/LLM-Groq%20gpt--oss--20b-purple)

---

## What Problem Does This Solve?

Remote engineering teams waste time in daily standups repeating status updates verbally, and blockers often get mentioned once and then forgotten. **DevPulse** lets engineers post async daily updates (what I did, what's next, blockers), automatically flags unresolved blockers older than 24 hours, and gives managers a live team health dashboard with AI-generated summaries — all without a live meeting.

Similar to Geekbot and Standuply, but built from scratch as a full-stack production-grade application.

---

## Live Demo

- 🌐 **Frontend:** [devpulse-kappa-rouge.vercel.app](https://devpulse-kappa-rouge.vercel.app)
- 🔌 **Backend API:** [devpulse-naz4.onrender.com/api/health](https://devpulse-naz4.onrender.com/api/health)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Express.js + Node.js |
| Database | PostgreSQL (Neon — serverless) |
| Cache | Redis (Upstash — serverless) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI Summary | Groq API (openai/gpt-oss-20b) + Prompt Engineering |
| Testing | Jest + Supertest (18 tests) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Key Features

- **JWT-based team authentication** — managers create teams, members join via invite code
- **Daily standup entries** — structured yesterday/today/blockers form
- **Auto-blocker flagging** — any blocker unresolved after 24 hours gets flagged 🚨 automatically
- **Team health dashboard** — managers see who posted today, active blockers, days posted in the last 7
- **AI Standup Summary** — manager clicks one button to get an LLM-generated structured daily summary with team health score, achievements, active blockers (with how long each has been open), and priorities — powered by Groq (openai/gpt-oss-20b) with prompt-engineered JSON output
- **Redis caching** — dashboard aggregation cached for 5 minutes; response shows `cached: true/false`
- **18 Jest/Supertest tests** — auth, standup, dashboard, manager-only access, blocker resolution

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Frontend (TypeScript)                          │
│  Pages: Login · Create Team · Join Team                 │
│         Standup Form · Manager Dashboard                │
│         AI Summary Component                            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (axios)
┌────────────────────────▼────────────────────────────────┐
│  Express.js REST API                                    │
│  Routes: /api/auth/* · /api/standup · /api/dashboard   │
│          /api/blockers/:id/resolve · /api/summary       │
│  Middleware: JWT auth · CORS · Error handling           │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │                        
┌──────────▼────────┐  ┌──────────▼────────┐  ┌──────────────────┐
│  PostgreSQL        │  │  Redis (Upstash)  │  │  Groq LLM API    │
│  4 tables          │  │  Dashboard cache  │  │  AI Summary      │
│  FK constraints    │  │  TTL: 5 minutes   │  │  Prompt Eng.     │
└───────────────────┘  └───────────────────┘  └──────────────────┘
```

---

## Database Schema

```sql
teams          — id, name, invite_code (unique), created_at
users          — id, name, email, password_hash, team_id (FK), role
standup_entries— id, user_id (FK), team_id (FK), yesterday, today,
                 has_blocker, entry_date (unique per user), created_at
blockers       — id, entry_id (FK), user_id (FK), team_id (FK),
                 description, is_resolved, created_at, resolved_at
```

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- A free [Neon.tech](https://neon.tech) account (PostgreSQL)
- A free [Upstash.com](https://upstash.com) account (Redis)
- A free [Groq API key](https://console.groq.com) (for AI Summary)

### 1. Clone the repo
```bash
git clone https://github.com/amn-00/devpulse.git
cd devpulse
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, GROQ_API_KEY
npm run migrate
npm run dev
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

### 4. Run tests
Tests wipe every table, so they need their own database — they refuse to run if `.env.test` points at the same database as `.env`. The easiest option is throwaway Docker containers (the same setup CI uses):
```bash
docker run -d --name devpulse-test-pg -e POSTGRES_USER=devpulse -e POSTGRES_PASSWORD=devpulse -e POSTGRES_DB=devpulse_test -p 55432:5432 postgres:16
docker run -d --name devpulse-test-redis -p 56379:6379 redis:7

cd backend
cp .env.test.example .env.test
npm run migrate:test   # creates tables in the test database
npm test
# 18 tests passing
```

---

## API Reference

### Auth
```bash
POST /api/auth/create-team
POST /api/auth/join-team
POST /api/auth/login
```

### Standup (requires JWT)
```bash
POST /api/standup
GET  /api/standup/mine
GET  /api/dashboard
PATCH /api/blockers/:id/resolve
POST /api/summary              # AI-generated standup summary (manager only)
```

---

## Resume Bullet Points

```
DevPulse — Async Standup & Blocker Tracker
TypeScript · Next.js · Express.js · PostgreSQL · Redis · Jest

- Built async team standup tracker — JWT auth, PostgreSQL schema
  (4 tables), Redis caching with 5-min TTL, auto-flags unresolved
  blockers after 24h; integrated Groq LLM API to generate
  structured daily summaries with prompt-engineered JSON output

- 18 Jest/Supertest integration tests passing; deployed on Vercel + Render
```

---

## Author

**Aman Chaudhary**
M.Tech AI & Robotics, Gautam Buddha University

[GitHub](https://github.com/amn-00) · [LinkedIn](https://www.linkedin.com/in/aman-chaudhary-dev/)
