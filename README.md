# AEx Fault Class Rubric

A web application for capturing engineer knowledge about AEx network fault classes. Covers all 19 fault classes with structured questions across definition, identification, diagnostics, resolution, and evaluation sections.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Storage**: JSON files (default) or PostgreSQL — switchable via env var

## Storage Modes

The app supports two storage backends, controlled by the `STORAGE_TYPE` environment variable:

| `STORAGE_TYPE` | Description |
|---|---|
| `json` (default) | Stores all data in JSON files inside the `data/` folder. No database needed. Great for Railway without a database add-on. |
| `postgres` | Stores data in a PostgreSQL database. Requires `DATABASE_URL`. |

> **Note on JSON mode + Railway:** Railway's filesystem is ephemeral by default — data resets on each redeploy unless you attach a Railway Volume and set `DATA_DIR` to point to it. For persistent storage without a database, use a Railway Volume mounted at e.g. `/data`, then set `DATA_DIR=/data`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `STORAGE_TYPE` | No | `json` (default) or `postgres` |
| `DATABASE_URL` | Only if `STORAGE_TYPE=postgres` | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `DATA_DIR` | No | Path to JSON data directory (JSON mode only). Defaults to `./data` in the project root |
| `JWT_SECRET` | No | Secret used to sign auth tokens. Defaults to a built-in value — set this in production |
| `PORT` | No | Port the server listens on. Defaults to `3000` |

## Running Locally

### Prerequisites

- Node.js 18+

### 1. Set environment variables (optional)

For JSON mode (default — no setup needed):

```
# No env vars required — data is stored in ./data/*.json
```

For Postgres mode, create a `.env` file or export:

```
STORAGE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/aex_fault_classes
```

If using Postgres, initialise the database first:

```bash
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < seed.sql
```

### 2. Install dependencies and run

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

## Deploying on Railway (JSON mode — simplest)

### 1. Push to GitHub

Ensure all files are committed and pushed to a GitHub repository.

### 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **GitHub** service pointing to your repository (no database needed)
3. Optionally add a **Volume** and mount it at `/data` for persistence across deploys

### 3. Configure environment variables

In the Railway GitHub service settings:

```
JWT_SECRET=<your-random-secret>
# Optional — only if using a Railway Volume:
DATA_DIR=/data
```

Railway automatically provides `PORT`. No `DATABASE_URL` or `STORAGE_TYPE` needed.

### 4. Build & start commands

Railway will detect the `package.json` scripts automatically:

- **Build**: `npm run build`
- **Start**: `npm start`

## Deploying on Railway (Postgres mode)

### 1. Push to GitHub and create a Railway project as above, but also add a PostgreSQL service.

### 2. Configure environment variables:

```
STORAGE_TYPE=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<your-random-secret>
```

### 3. Initialise the database after the first deploy:

```bash
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < seed.sql
```

## Project Structure

```
├── src/                    # Backend (Express + TypeScript)
│   ├── index.ts            # App entry point
│   ├── db.ts               # PostgreSQL connection pool (Postgres mode only)
│   ├── middleware/
│   │   └── auth.ts         # JWT auth middleware
│   ├── storage/
│   │   ├── index.ts        # Storage factory (picks JSON or Postgres based on STORAGE_TYPE)
│   │   ├── types.ts        # IStorage interface and shared types
│   │   ├── csv.ts          # JSON file storage implementation
│   │   └── postgres.ts     # PostgreSQL storage implementation
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
├── data/                   # JSON data files (JSON mode storage)
│   ├── users.json          # Admin user (pre-seeded)
│   ├── fault_classes.json  # 19 fault classes (pre-seeded)
│   ├── fault_class_answers.json
│   └── global_answers.json
├── schema.sql              # Database DDL (Postgres mode)
├── schema.dbml             # Database schema (DBML format)
└── seed.sql                # Seed data for Postgres mode
```
