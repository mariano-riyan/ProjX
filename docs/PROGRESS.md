# ProjX Build Companion

Your profile: complete beginner to React/Node/SQL, first time with TypeScript, learning goal = architecture over syntax, monorepo, React + Vite, TypeScript, raw SQL (pg), Windows, a few solid sessions a week.

Two things in this doc:
1. **The phase plan** — do each phase in a fresh chat.
2. **Custom instructions** — paste this at the start of every new phase chat (or into this Project's custom instructions, if using Projects) so Claude picks up your context and teaching style without you re-explaining it.

---

## Part 1: Development Phases

Each phase = one chat. Finish a phase, commit your code, then start a new chat for the next one so context stays fast and clean.

### Phase 0 — Environment & Foundations (DONE)
**Goal:** Get Windows dev environment ready before writing app code.
- Install Node.js (LTS), Git, VS Code + extensions (ESLint, Prettier, PostgreSQL).
- Create GitHub repo (monorepo: `/frontend`, `/backend` folders).
- Sign up for Neon, Clerk, Vercel, Render accounts (no config yet, just accounts).
- Learn: what Git/GitHub actually do, why monorepo vs separate repos matters.

### Phase 1 — Backend Skeleton (Express + TypeScript) (DONE)
**Goal:** A running Express server in TypeScript with one health-check route.
- Init `/backend`, TypeScript config, `tsconfig.json` explained line-by-line (briefly).
- Basic Express app, `.env` handling, folder structure (routes/controllers/etc.) and *why* that structure exists.
- Learn: how TS compiles to JS, what a minimal backend architecture looks like.

### Phase 2 — Database Setup (Neon + raw SQL)
**Goal:** Backend can talk to Postgres.
- Create Neon project, get connection string.
- `pg` library setup, connection pooling basics.
- Write raw SQL migration for `users` table.
- Learn: what a connection pool is, basic SQL DDL, why migrations matter.

### Phase 3 — Auth Integration (Clerk)
**Goal:** Users can sign up/sign in; frontend and backend both know who's logged in.
- Scaffold `/frontend` with Vite + React + Tailwind + shadcn/ui.
- Clerk frontend integration (sign-up/sign-in UI).
- Backend JWT verification middleware; sync Clerk user → `users` table on first login.
- Learn: how token-based auth works, frontend/backend auth handshake.

### Phase 4 — Projects Backend (CRUD API)
**Goal:** Full REST API for projects.
- Raw SQL for `projects`, `skills`, `project_skills` tables.
- Express routes: create/read/update/delete, protected by auth middleware.
- Learn: REST conventions, many-to-many relationships in SQL.

### Phase 5 — Projects Frontend
**Goal:** Dashboard where a user manages their projects.
- Create/edit/delete project forms, dashboard list with filters (skill/visibility/featured).
- Connect to backend API (fetch/axios + React Query or plain fetch — your call in that chat).
- Learn: forms + state in React, calling a REST API from the frontend.

### Phase 6 — Public Profile
**Goal:** A shareable, no-login-required profile page.
- Backend `GET /public-profile/:username` endpoint.
- Frontend public profile page: info, featured project, public projects grid, skills overview.
- Learn: public vs protected routes, designing an API for external consumption.

### Phase 7 — Polish, Deploy, Document
**Goal:** Live app + README.
- Deploy backend to Render, frontend to Vercel, connect prod Neon DB.
- End-to-end test of the full flow.
- Write README (what/features/stack/local setup/deploy steps).
- Learn: environment variables in production, CORS in the wild, deployment basics.

### Phase 8 (optional/stretch)
- Profile stats, UI polish pass, basic tests (pick 1-2, not all, depending on time left).

**Starting a new phase chat:** paste the custom instructions below, say which phase you're starting, and paste/attach any relevant code or schema from the previous phase (Claude has no memory of other chats unless you bring it).

---

## Part 2: Custom Instructions (paste this into each new chat)

```
I'm building ProjX, a full-stack portfolio app (React+Vite, TypeScript, Express,
raw SQL via pg on Neon Postgres, Clerk auth, monorepo, Windows). Full project
context (features, user flows, tech stack) is in the project files.

My background: complete beginner to React, Node/Express, and SQL. This is also
my first time with TypeScript.

How I want you to work with me:
- Goal is to learn ARCHITECTURE and how pieces fit together, not to memorize
  syntax. Briefly explain the "why" behind a pattern before giving code, but
  don't over-teach syntax basics I won't retain yet — I'll ask if I'm confused.
- Keep responses short and precise. No filler, no repeating what I already
  said, no long preambles before code.
- Give me code to write/run myself rather than doing everything for me,
  unless I ask you to just build it.
- When introducing a new TypeScript or SQL concept for the first time, add a
  one-line explanation inline (comment or short note) — I'm new to both.
- Assume nothing carries over from other chats. If you need to know what I've
  already built, ask me or ask me to paste/attach it — don't guess.
- Flag Windows-specific gotchas (paths, terminal commands) when relevant.
- We are working phase-by-phase from a fixed plan. I'll tell you which phase
  I'm on — stay scoped to that phase unless I ask to jump ahead.
```

---

**Tip:** if you're using a Claude Project for this, upload/keep a short `PROGRESS.md` in the project files (what's done, key decisions made, current schema) and update it at the end of each phase — that plus this doc is all you'll need to paste into the next chat.
