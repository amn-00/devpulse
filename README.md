# ⚡ DevPulse — Async Standup & Blocker Tracker

**Portfolio Project | Aman Chaudhary | Full-Stack Engineer**

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express.js-4.19-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-Upstash-red)
![Jest](https://img.shields.io/badge/Jest-29-orange)

---

## What Problem Does This Solve?

Remote engineering teams waste time in daily standups repeating status updates verbally, and blockers often get mentioned once and then forgotten. **DevPulse** lets engineers post async daily updates (what I did, what's next, blockers), automatically flags unresolved blockers older than 24 hours, and gives managers a live team health dashboard — all without a live meeting.

Similar to Geekbot and Standuply, but built from scratch as a full-stack production-grade application.

---

## Live Demo

- 🌐 **Frontend:** [devpulse.vercel.app](https://devpulse.vercel.app)
- 🔌 **Backend API:** [devpulse-api.onrender.com](https://devpulse-api.onrender.com/api/health)

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
| Testing | Jest + Supertest (15+ tests) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Key Features

- **JWT-based team authentication** — managers create teams, members join via invite code
- **Daily standup entries** — structured yesterday/today/blockers form
- **Auto-blocker flagging** — any blocker unresolved after 24 hours gets flagged 🚨 on the dashboard automatically
- **Team health dashboard** — managers see: who posted today, active blockers, 7-day posting streak per member
- **Redis caching** — dashboard aggregation query cached for 5 minutes; response shows `cached: true/false` so you can verify it's working
- **15+ Jest/Supertest tests** — auth endpoints, standup creation, dashboard, blocker resolution

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Frontend (TypeScript)                          │
│  Pages: Login · Create Team · Join Team                 │
│         Standup Form · Manager Dashboard                │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (axios)
┌────────────────────────▼────────────────────────────────┐
│  Express.js REST API                                    │
│  Routes: /api/auth/* · /api/standup · /api/dashboard   │
│          /api/blockers/:id/resolve                      │
│  Middleware: JWT auth · CORS · Error handling           │
└────────────────────────┬────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌───────────────────┐    ┌───────────────────────┐
│  PostgreSQL        │    │  Redis (Upstash)      │
│  Tables:           │    │  Dashboard cache      │
│  teams · users     │    │  TTL: 5 minutes       │
│  standup_entries   │    └───────────────────────┘
│  blockers          │
└───────────────────┘
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
# Fill in your DATABASE_URL, REDIS_URL, and JWT_SECRET in .env
npm run migrate   # Creates all database tables
npm run dev       # Starts on http://localhost:4000
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev       # Starts on http://localhost:3000
```

### 4. Run tests
```bash
cd backend
cp .env.test.example .env.test
# Set your test database URL in .env.test (use a separate Neon branch)
npm test
```

---

## API Reference

### Auth
```bash
POST /api/auth/create-team   # Create team + manager account
POST /api/auth/join-team     # Join via invite code
POST /api/auth/login         # Login
```

### Standup (requires JWT)
```bash
POST /api/standup            # Submit today's standup
GET  /api/standup/mine       # My entry history
GET  /api/dashboard          # Team dashboard (manager only)
PATCH /api/blockers/:id/resolve  # Resolve a blocker
```

### Example — submit a standup with a blocker
```bash
curl -X POST http://localhost:4000/api/standup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "yesterday": "Completed the auth API",
    "today": "Build the dashboard UI",
    "blockerDescription": "Waiting on design review approval"
  }'
```

---

## Deployment

### Backend → Render
1. Push repo to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV=production)
6. After deploy, run migration: `npm run migrate`

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## Resume Bullet Points
```
DevPulse — Async Standup & Blocker Tracker  ·  TypeScript · Next.js · Express.js · PostgreSQL · Redis · Jest

• Built full-stack team standup tracker solving async status reporting for remote 
  engineering teams; auto-flags blockers unresolved after 24 hours on manager dashboard

• Implemented JWT team-scoped authentication (bcrypt + jsonwebtoken), normalized 
  PostgreSQL schema (4 tables, FK constraints), and Redis caching reducing repeated 
  dashboard query load with 5-minute TTL

• Wrote 15+ Jest/Supertest integration tests covering auth, standup submission, 
  dashboard aggregation, and blocker resolution endpoints; deployed on Vercel + Render
```

---

## Author

**Aman Chaudhary**
M.Tech AI & Robotics, Gautam Buddha University

[GitHub](https://github.com/amn-00) · [LinkedIn](https://www.linkedin.com/in/aman-chaudhary-dev/)
