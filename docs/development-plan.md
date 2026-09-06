# Development plan (1 month outline)


*You can adjust this, but a realistic 4-week plan:*


## Week 1 — Setup & auth

- Initialize frontend and backend repos.
- Set up Tailwind + shadcn/ui in frontend.
- Integrate Clerk on frontend (sign-up, sign-in, user profile).
- Set up Express server with basic health route.
- Connect to Neon Postgres.
- Implement users table and sync with Clerk (create user on first login).


## Week 2 — Projects CRUD

- Design and create projects, skills, project_skills tables.
- Implement backend routes for projects (create, read, update, delete).
- Build frontend forms:
    - create project.
    - edit project.
    - delete project.
- Build dashboard list view with filters.


## Week 3 — Public profile & skills

- Implement public-profile/:username endpoint.
- Build public profile page:
    - user info.
    - featured project.
    - public projects grid.
    - skills overview.
- Add skill tags UI in project form.
- Add reflection field and featured toggle.


## Week 4 — Polish, deploy, and docs

- Deploy backend to Render.
- Deploy frontend to Vercel.
- Connect to Neon in production.
- Test full flow end-to-end.
- Write README:
    - what ProjX is.
    - features.
    - tech stack.
    - how to run locally.
    - how to deploy.
- Optional:
    - add simple stats on profile.
    - improve UI/UX.
    - add basic tests.