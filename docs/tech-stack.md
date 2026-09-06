# Tech stack details


## Frontend

- React (Vite or Next.js is fine; if you want simplest with - Vercel, Next.js is very smooth).
- Tailwind CSS.
- shadcn/ui for components.
- React Query or SWR for data fetching (optional but - recommended).
- Axios or fetch for API calls.
- Clerk React SDK for auth UI and session management.

## Backend

- Node.js + Express.
- TypeScript or JavaScript (TypeScript recommended for a - portfolio).
- Prisma ORM or pg + manual queries.
- CORS configured for your Vercel frontend domain.
- Environment variables:
    - DATABASE_URL (Neon Postgres)
    - CLERK_SECRET_KEY.
    - CLERK_PUBLISHABLE_KEY (optional on backend).
    - FRONTEND_URL (for CORS).

## Database

- Neon Postgres.
- Use migrations (Prisma migrate or SQL scripts).
- One database per environment (dev/prod) if possible.

## Auth

- Clerk:
    - Handle sign-up/sign-in on frontend.
    - Use Clerk middleware or JWT verification on backend to protect routes.
    - Store clerk_id in users table to link DB rows to Clerk users.

## Hosting

- Frontend: Vercel.
    - Connect GitHub repo.
    - Set env vars for API base URL and Clerk publishable key.

- Backend: Render.
    - Create a “Web Service”.
    - Connect GitHub repo (backend folder).
    - Set env vars: DATABASE_URL, CLERK_SECRET_KEY, FRONTEND_URL.

- Database: Neon.
    - Create project and database.
    - Copy connection string into Render env vars.