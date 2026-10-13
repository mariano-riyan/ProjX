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

### Phase 2 — Database Setup (Neon + raw SQL) (DONE)
**Goal:** Backend can talk to Postgres.
- Create Neon project, get connection string.
- `pg` library setup, connection pooling basics.
- Write raw SQL migration for `users` table.
- Learn: what a connection pool is, basic SQL DDL, why migrations matter.
*Note:* I am using manual migrations (paste into Neon SQL editor) for now.

### Phase 3 — Auth Integration (Clerk) (DONE)
- Frontend: Vite+React+TS scaffolded, Tailwind + shadcn/ui added, Clerk integrated
  (ClerkProvider in main.tsx, SignedIn/SignedOut/SignInButton/UserButton in App.tsx).
- Backend: @clerk/express installed, clerkMiddleware() global, getAuth() used
  per-route (requireAuth() is deprecated — avoid it).
- /me route: verifies session, fetches full Clerk user via clerkClient.users.getUser(),
  upserts into `users` table on clerk_id (ON CONFLICT DO UPDATE).
- Key learning: TS `emailAddresses[0]` needs optional chaining + null check.
- Key learning: `verbatimModuleSyntax` requires `import type` for type-only imports
  (e.g. Express's Request/Response).

### Post-Phase 3 cleanup (DONE)
- Refactored backend from single index.ts into routes/ + controllers/ + db/ structure.
  index.ts now just wires middleware + routers together.
- Decision: SQL queries currently live inline inside controllers (not yet split into
  db/queries/). Revisit this in Phase 4 — once multiple routes need the same query
  (e.g. project lookups used by both CRUD and public profile), extract shared queries
  into db/queries/ to avoid duplication.

### Phase 4 — Projects Backend (CRUD API) (DONE)
**Goal:** Full REST API for projects.
- Migration `backend/src/db/migrations/002_create_projects.sql` — three tables:
  - `projects` (owned by `user_id`, `visibility` check constraint, `screenshots` as `TEXT[]`).
  - `skills` — **per-user** model (`user_id` + `name`, `UNIQUE (user_id, name)`) — each
    user owns their own skill rows rather than sharing a global skills table.
  - `project_skills` — join table, composite PK `(project_id, skill_id)`, `ON DELETE CASCADE`
    on both FKs so deleting a project or skill cleans up links automatically.
- Naming convention: `projects.routes.ts` / `projects.controller.ts` (matches `user.routes.ts` pattern).
- `POST /api/projects` (createProject) — uses `pool.connect()` + `BEGIN/COMMIT/ROLLBACK`
  because it's a multi-step write (insert project → upsert each skill via
  `ON CONFLICT (user_id, name) DO UPDATE ... RETURNING id` → link in `project_skills`).
  All steps commit together or roll back together.
- `GET /api/projects` (listProjects) — uses plain `pool.query()` (single read, no
  transaction needed). Returns each project with a `skills: string[]` field via
  `LEFT JOIN project_skills/skills` + `json_agg(...) FILTER (...)` + `GROUP BY p.id`.
- `PATCH /api/projects/:id` (updateProject) — ownership check (404 if project doesn't
  exist, 403 if it exists but isn't the caller's) before editing. Partial update via
  `COALESCE(new_value, existing_value)` per field so omitted fields aren't overwritten
  with null. Does **not** yet support editing a project's skills (stretch item, not done).
- `DELETE /api/projects/:id` (deleteProject) — same ownership check, then
  `DELETE FROM projects WHERE id = $1`, responds `204 No Content`. Relies on
  `ON DELETE CASCADE` to clean up `project_skills` rows.
- All four routes tested end-to-end via Postman (Clerk session token from
  `await window.Clerk.session.getToken()` in browser console — token expires fast,
  ~60s, so grab it right before sending each request).
- Key learning: `pool.query()` vs `pool.connect()` — query() borrows a connection for
  one statement; connect() holds one dedicated connection across multiple statements,
  required for BEGIN/COMMIT to apply to the same session.
- Key learning: 404 vs 403 — don't collapse "doesn't exist" and "exists but not yours"
  into one response.
- **Known gap / carried forward:** the "resolve internal `userId` from Clerk `clerk_id`"
  block is now duplicated across `/me`, create, list, update, delete (5 places). Extract
  into a shared helper (e.g. `db/queries/users.ts` or a small auth-lookup util) — good
  candidate for the `db/queries/` refactor already flagged after Phase 3.
- **Known gap:** updating a project's skills (add/remove tags via PATCH) not implemented —
  left as a stretch item, can revisit in Phase 5 when building the edit form.

### Phase 5 — Projects Frontend (DONE)
**Goal:** Dashboard where a user manages their projects.
- Providers wired in `main.tsx`: `ClerkProvider` > `QueryClientProvider` > `BrowserRouter`.
- `frontend/src/lib/api.ts` — `useApi()` hook wraps `fetch`, attaches Clerk token via
  `getToken()`, throws on non-2xx, returns `null` on `204` (needed for DELETE responses).
- Backend CORS was missing — added `cors` package, configured via `FRONTEND_URL` env var,
  restricted to Vite dev origin.
- Routes: `/` (public, sign-in), `/dashboard` (project list), `/dashboard/new` (create),
  `/dashboard/edit/:id` (edit) — create and edit share one component (`NewProject.tsx`).
- `NewProject.tsx` — single `formData` object (not per-field `useState`) since edit mode
  hydrates all fields at once from a `useQuery` fetch (`GET /api/projects/:id`) inside a
  `useEffect`. `isEditMode = Boolean(id)` (from `useParams`) decides POST vs PATCH in the
  save mutation.
- Dashboard: `useQuery` lists projects, `useMutation` handles delete (with cache
  invalidation via `queryClient.invalidateQueries({ queryKey: ['projects'] })`).
- Filters (skill text match, visibility, featured-only) implemented client-side as a
  derived `filteredProjects` array — no backend query params yet.
- **Known gap:** `<h1>Add Project</h1>` is hardcoded — doesn't reflect edit mode.
- **Known gap:** unclear whether `updateProject` PATCH controller accepts/updates a
  project's `skills` array (flagged as not implemented in Phase 4 notes) — worth
  verifying in Phase 6 or later if skill edits don't seem to persist.

### Phase 6 — Public Profile (DONE)
**Goal:** A shareable, no-login-required profile page.
- Backend: `GET /public-profile/:username` — see previous entry, unchanged.
- Frontend: `frontend/src/pages/PublicProfile.tsx`, route `/u/:username` in `App.tsx`, deliberately outside `ProtectedRoute`.
  - Plain `fetch` (not `useApi()`) — this page must work with no Clerk session.
  - `useQuery<Profile>` keyed by `[username]`, typed to match the actual backend response shape (one profile object with a nested `projects: Project[]`, not an array of projects).
  - Featured project found via `.find(p => p.featured)`; rest of public projects via `.filter(p => !p.featured)`.
  - Skills overview: de-duplicated across all projects via `.flatMap()` + `new Set()`.
- Tested end-to-end: valid username, 404 on unknown username, empty-fields case, and featured+skills case.
- Learnings: `.find()` vs `.filter()` vs `.flatMap()` — picking the array method based on the shape you actually need back.

### Pre-Phase 7 cleanup (DONE)
- Extracted `getUserIdFromClerkId(db: Queryable, clerkId)` into `backend/src/db/queries/users.ts`.
  Takes `Pool | PoolClient`, returns `number | null`; callers choose the status code.
  Used in all 5 project controllers (create, list, get, update, delete).
- Rule learned: run every early-exit check (auth, validation, user lookup) BEFORE
  `pool.connect()` / `BEGIN`, so a `return` can never leave a transaction open.
- `PATCH /api/projects/:id` now supports `skills`: omitted = unchanged, array = full
  replace (`DELETE FROM project_skills` + re-upsert loop), `[]` clears all tags. Runs in a
  transaction with the project UPDATE; inner catch rolls back and rethrows to the outer 500 handler.
- `NewProject.tsx`: heading reflects edit mode; added `screenshots: string[]` to `formData`
  with an add/remove URL list (validated with `new URL()`); submit now always sends the real list.
- No known gaps remaining.

### Phase 7 — Polish, Deploy, Document (DONE)
**Goal:** Live app + README.
- Backend: added `build` (`tsc`) and `start` (`node dist/index.js`) scripts to `backend/package.json`.
  Render reads `PORT` from env; CORS origin comes from `FRONTEND_URL`.
- Prod DB: separate Neon project (not a branch of dev), migrations run manually in order
  (users, then `002_create_projects.sql`). Dev `.env` still points at the dev DB; the prod
  connection string lives only in Render env vars.
- Render (Web Service): Root Directory `backend`, build `npm install && npm run build`,
  start `npm start`. Env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `FRONTEND_URL`.
  Free tier sleeps after ~15 min idle (first request ~50s).
- Vercel: Root Directory `frontend`, `frontend/vercel.json` rewrites all paths to `/index.html`
  so React Router routes survive a refresh. Env: `VITE_API_URL` (no trailing slash) + Clerk
  publishable key.
- Live: frontend `https://proj-x-five.vercel.app`, backend `https://projx-d8ch.onrender.com`.
- Clerk: dev keys on both sides (prod Clerk instances need a custom domain). Keys must come
  from the same Clerk instance or every request 401s.
- Bug found in prod: the fresh prod DB had no `users` row, so project routes returned 404
  (`getUserIdFromClerkId` returned null). Fix: `Dashboard.tsx` now calls `GET /me` first
  (`meQuery`), and the projects query uses `enabled: meQuery.isSuccess`.
  Idea for later: move this sync into `ProtectedRoute` so every protected page gets it
  (e.g. landing directly on `/dashboard/edit/:id`).
- Full end-to-end test passed on the live site (auth, CRUD, skills edit, public profile, refresh on `/u/:username`).
- README written and merged.
- Key learnings:
  - Vite env vars (`VITE_*`) are baked in at build time; changing one needs a redeploy.
  - CORS compares origins as exact strings (no trailing slash). Vercel per-deploy URLs
    differ from the production alias, so test on the alias only.
  - A committed `frontend/.env` can override Vercel env vars at build time.

### Pre-Phase 8: CI/CD with GitHub Actions (IN PROGRESS — continue in a new chat)
**Goal:** Build, lint, and deploy automatically so Phase 8 UI work needs no manual steps.
**Decisions already made:**
- Repo is public (Actions minutes are free); local Node is v24.19.0, CI uses Node 24.
- Option B: GitHub Actions controls deploys. After CI passes on `main`, Actions triggers
  Render via a deploy hook and Vercel via the Vercel CLI. Render and Vercel auto-deploy
  from Git will be turned off so nothing deploys twice or skips CI.
- CI runs on every pull request AND on pushes to `main`.
- Checks: frontend `npm run lint` + `npm run build`; backend `npm run build` only (no ESLint
  in backend yet, optional later). The builds already run `tsc`, so type-checking is covered.
**Plan (one task at a time):**
1. Create `.github/workflows/ci.yml` (two parallel jobs, `working-directory` for the monorepo,
   `npm ci`, npm cache). Before starting: confirm `package-lock.json` is committed in BOTH
   `frontend/` and `backend/`, and that `npm run lint` passes locally in `frontend/`.
   Work on branch `ci-pipeline`, open a PR, confirm both jobs go green.
2. Turn off auto-deploy: Render (Settings, Auto-Deploy off) and Vercel (disconnect Git
   deploys, or an ignored-build-step rule).
3. Add deploy jobs that `needs:` the CI jobs and run only on `push` to `main`:
   - Render: deploy hook URL stored as a GitHub secret, called with `curl`.
   - Vercel: `vercel` CLI with secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
     (note: Vercel Root Directory is `frontend`).
4. Verify: push a trivial change to `main`, watch CI then deploy, confirm the live site updates.
   Optionally add branch protection requiring CI to pass before merging.
**Pitfalls to remember:** YAML needs spaces, not tabs; secrets go in GitHub repo Settings,
never in the workflow file; Vite env vars still must be set on the Vercel project.

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
