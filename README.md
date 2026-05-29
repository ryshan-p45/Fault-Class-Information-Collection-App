# AEx Fault Class Rubric

A web application for capturing engineer knowledge about AEx network fault classes. Covers all 19 fault classes with structured questions across definition, identification, diagnostics, resolution, and evaluation sections.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | No | Secret used to sign auth tokens. Defaults to a built-in value — set this in production |
| `PORT` | No | Port the server listens on. Defaults to `3000` |


## Running Locally

### Prerequisites

- Node.js 18+
- A running PostgreSQL instance

### 1. Set up the database

```bash
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < seed.sql
```

### 2. Set environment variables

Create a `.env` file (or export directly):

```
DATABASE_URL=postgresql://user:password@localhost:5432/aex_fault_classes
```

### 3. Install dependencies and run

**Start the backend:**

```bash
npm install
npm run dev
```

**In a separate terminal, start the frontend dev server:**

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and proxies API calls to the backend on port `3000`.

## Deploying on Railway

### 1. Push to GitHub

Ensure all files are committed and pushed to a GitHub repository.

### 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **PostgreSQL** service to the project
3. Add a **GitHub** service pointing to your repository

### 3. Configure environment variables

In the Railway GitHub service settings, add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<your-random-secret>
```

Railway automatically provides `PORT`.

### 4. Initialise the database

After the first deploy, open the Railway PostgreSQL shell (or connect via `psql`) and run:

```bash
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < seed.sql
```

### 5. Build & start commands

Railway will detect the `package.json` scripts automatically:

- **Build**: `npm run build`
- **Start**: `npm start`

The build script installs client dependencies, builds the React frontend, then compiles the TypeScript backend. The Express server then serves the built frontend as static files.

## Project Structure

```
├── src/                    # Backend (Express + TypeScript)
│   ├── index.ts            # App entry point
│   ├── db.ts               # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts         # JWT auth middleware
│   └── routes/
│       ├── auth.ts         # Login / logout
│       ├── faultClasses.ts # Fault class list + updates
│       ├── answers.ts      # Per-fault-class answers
│       ├── globalAnswers.ts# Section 1 & 3 global answers
│       └── exportCsv.ts    # CSV export
├── client/                 # Frontend (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── FaultClassDetail.tsx
│       │   └── GlobalAnswers.tsx
│       └── components/
│           └── Navbar.tsx
├── schema.sql              # Database DDL
├── schema.dbml             # Database schema (DBML format)
└── seed.sql                # Initial data (fault classes + admin user)
```
