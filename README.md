# ProjX

ProjX is a full-stack web application designed for developers to showcase their projects as tangible proof of skills. Instead of a traditional portfolio link list, ProjX highlights skills used, proof links (GitHub, live demo, screenshots), and personal reflections on what was learned.

---

## Features

- **Authentication & User Management**: Secure authentication powered by Clerk, automatically syncing user profiles with PostgreSQL.
- **Project Showcase (CRUD)**:
  - Add, view, edit, and delete projects.
  - Project fields include title, short/long descriptions, GitHub link, live demo URL, screenshot links, and reflection ("What I learned").
  - Tag projects with custom skills.
  - Public/Private visibility controls.
  - Pin standout work with the featured project toggle.
- **Personal Dashboard**: Filter projects in real time by skill keyword, visibility status, or featured flag.
- **Public Profiles (`/u/:username`)**: Shareable portfolio pages viewable by recruiters and peers without requiring an account, featuring pinned work and aggregated skill tags.

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Auth**: [@clerk/clerk-react](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) (TypeScript)
- **Database Client**: [pg](https://node-postgres.com/) (connection pool with raw SQL queries and transactions)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
- **Auth**: [@clerk/express](https://clerk.com/)
- **Development Tooling**: `tsx` (TypeScript execute & watch mode)

---

## Project Structure

```text
ProjX/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route request handlers
│   │   ├── db/
│   │   │   ├── migrations/   # Raw SQL migration files
│   │   │   ├── queries/      # Shared database helper functions
│   │   │   └── pool.ts       # PostgreSQL connection pool configuration
│   │   ├── routes/           # Express router endpoints
│   │   └── index.ts          # Server entry point & middleware configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # UI and shared components
│   │   ├── lib/              # API client and utility helpers
│   │   ├── pages/            # Dashboard, NewProject, PublicProfile pages
│   │   ├── App.tsx           # Application routing & protected routes
│   │   └── main.tsx          # Provider hierarchy (Clerk, QueryClient, Router)
│   ├── package.json
│   └── vite.config.ts
└── docs/                     # Project specs, development roadmap, and notes
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- A [Clerk](https://clerk.com/) account (for authentication API keys)
- A [Neon](https://neon.tech/) or standard PostgreSQL database instance

---

### 1. Database Setup

Run the SQL migration scripts located in `backend/src/db/migrations/` in your PostgreSQL database (e.g., via the Neon SQL Editor or `psql`):

1. `001_create_users.sql` — Creates the `users` table.
2. `002_create_projects.sql` — Creates `projects`, `skills`, and `project_skills` tables.

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `backend/`:
   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL=postgresql://<username>:<password>@<host>/<database>?sslmode=require
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:3000`.

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## Available Scripts

### Backend (`/backend`)
- `npm run dev`: Runs the API server with auto-reload using `tsx watch`.
- `npm run build`: Compiles TypeScript to JavaScript into `dist/`.
- `npm run start`: Runs the compiled production build with `node dist/index.js`.

### Frontend (`/frontend`)
- `npm run dev`: Launches the Vite development server with HMR.
- `npm run build`: Type-checks and creates the production bundle.
- `npm run lint`: Runs ESLint across the frontend codebase.
- `npm run preview`: Previews the production build locally.
