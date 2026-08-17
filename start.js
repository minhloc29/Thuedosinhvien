// LabShare — production entrypoint (local / non-Render platforms).
//
// NOTE: Render does NOT use this file. render.yaml runs everything in its
// BUILD phase and its startCommand is `cd server && npx prisma migrate deploy
// && node src/index.js`. This file is a convenient local equivalent of that
// full flow when you run `npm start` on your own machine:
//   1. install backend deps (server/)
//   2. apply Prisma migrations in production (non-interactive)
//   3. build the Vite frontend (user app + admin) into dist/
//   4. start the Express server (which also serves dist/ statically)
//
// Local dev still uses the separate `npm run dev` (Vite) + `cd server && npm run dev`.

import { execSync } from "node:child_process";
import fs from "node:fs";

// Local machines often run behind a corporate proxy (HTTPS_PROXY / http_proxy).
// Those vars make Prisma unable to reach the Neon Postgres host (P1001). Strip
// them for this process's child commands so the DB / npm / build work regardless.
for (const k of ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"]) {
  delete process.env[k];
}

const step = (msg) => console.log(`\n==> ${msg}`);

step("Install backend dependencies (server/)");
execSync("cd server && npm install", { stdio: "inherit" });

step("Apply database migrations (prisma migrate deploy)");
execSync("cd server && npx prisma migrate deploy", { stdio: "inherit" });

// Rebuild the frontend only if there's no build yet. Render's build phase
// already produces dist/, so rebuilding again here (in the lower-memory start
// phase) is redundant and can OOM on the free tier.
if (!fs.existsSync("dist/index.html")) {
  step("Build frontend (user app + admin)");
  execSync("npm run build", { stdio: "inherit" });
} else {
  step("Frontend already built (dist/ present) — skipping rebuild");
}

step("Start LabShare server");
execSync("cd server && npm start", { stdio: "inherit" });
