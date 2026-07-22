# ⚡ DevPulse — Async Standup & Blocker Tracker

**Portfolio Project | Aman Chaudhary | Full-Stack Engineer**

![CI](https://github.com/amn-00/devpulse/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express.js-4.19-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-Upstash-red)
![Jest](https://img.shields.io/badge/Jest-29-orange)
![LLM](https://img.shields.io/badge/LLM-Groq%20LLaMA-purple)

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
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Express.js + Node.js |
| Database | PostgreSQL (Neon — serverless) |
| Cache | Redis (Upstash — serverless) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI Summary | Groq LLaMA API + Prompt Engineering |
| Testing | Jest + Supertest (17 tests) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Key Features

- **JWT-based team authentication** — managers create teams, members join via invite code
- **Daily standup entries** — structured yesterday/today/blockers form
- **Auto-blocker flagging** — any blocker unresolved after 24 hours gets flagged 🚨 automatically
- **Team health dashboard** — managers see who posted today, active blockers, 7-day posting streak
- **AI Standup Summary** — manager clicks one button to get a LLaMA-generated structured daily summary with team health score, achievements, active blockers, and priorities — powered by Groq with prompt-engineered JSON output
- **Redis caching** — dashboard aggregation cached for 5 minutes; response shows `cached: true/false`
- **17 Jest/Supertest tests** — auth, standup, dashboard, blocker resolution

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
│  PostgreSQL        │  │  Redis (Upstash)  │  │  Groq LLaMA API  │
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
```bash
cd backend
npm test
# 17 tests passing
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
  blockers after 24h; integrated Groq LLaMA API to generate
  structured daily summaries with prompt-engineered JSON output

- 17 Jest/Supertest integration tests passing; deployed on Vercel + Render
```

---

## Author

**Aman Chaudhary**
M.Tech AI & Robotics, Gautam Buddha University

[GitHub](https://github.com/amn-00) · [LinkedIn](https://www.linkedin.com/in/aman-chaudhary-dev/)
