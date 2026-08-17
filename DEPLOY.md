# Deploying LabShare to Render

LabShare is a two-part app — a Vite React frontend (user app + admin FE) and an
Express + Prisma + PostgreSQL (Neon) backend. This repo is wired so a **single
Render Web Service** serves both the API (`/api/*`, `/auth/*`) and the built
frontend (`/` and `/admin.html`) from one URL.

`start.js` (run by Render) does, in order: install `server/` deps → apply
migrations (`prisma migrate deploy`) → build the frontend (`vite build`) →
start Express.

## Prerequisites (one-time)

1. **Neon Postgres** — create a free database at [neon.tech](https://neon.tech).
   Copy the connection string:
   `postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require`
2. **A long JWT secret** — generate one:
   ```
   openssl rand -hex 32
   ```

## Deploy

### Option A — Render Blueprint (recommended)

1. Commit and push this repo (`git push origin main`).
2. Render dashboard → **New → Blueprint** → connect your GitHub repo → Render
   reads `render.yaml` and creates the `labshare` service.
3. In the service's **Environment** settings, set the two `sync:false` vars:
   - `DATABASE_URL` → your Neon connection string
   - `JWT_SECRET` → the random hex from above
4. Render builds and starts automatically. Deploys again on every push to `main`.

### Option B — Manual Web Service

1. Render dashboard → **New → Web Service** → connect repo.
2. Runtime: **Node**; **Build command**: `npm install`; **Start command**: `node start.js`.
3. Add `DATABASE_URL` and `JWT_SECRET` env vars (as above). Set `NODE_VERSION=20`.
4. Deploy.

## Seed the database (once)

After the DB is reachable and migrations have run, populate it with demo
categories, users, products, consignments and bookings:

```
# In the Render service shell (or locally against the same DATABASE_URL)
cd server && npx prisma db seed
```

Seed logins — **password is `password123` for all**:
| Role     | Email              |
|----------|--------------------|
| Admin    | `admin@labshare.vn` |
| Renter   | `thutrang@bk.edu.vn` |
| Senior   | `ducanh@bk.edu.vn` / `hainam@bk.edu.vn` |
| Both     | `minhquan@bk.edu.vn` |

Logging in as **admin** redirects to the admin FE (`/admin.html`); any other
account lands on the renter/senior user app.

## Environment variables

| Var           | Required | Notes                                          |
|---------------|----------|------------------------------------------------|
| `DATABASE_URL`| yes      | Neon Postgres connection string (with `sslmode=require`) |
| `JWT_SECRET`  | yes      | Long random string; signs/verifies auth tokens |
| `PORT`        | no       | Render injects `PORT` automatically            |

Local copies live in `server/.env` (gitignored); see `server/.env.example`.

## Local production preview

```
npm run build                # build user + admin FE into dist/
DATABASE_URL=... JWT_SECRET=... npm start   # root start.js
# then open http://localhost:4000
```

## Notes

- `dist/`, `node_modules/`, and `server/.env` are gitignored — never committed.
- The frontend calls same-origin `/api` and `/auth`, so no CORS or API-URL
  config is needed in production.
