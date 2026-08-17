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

const step = (msg) => console.log(`\n==> ${msg}`);

step("Install backend dependencies (server/)");
execSync("cd server && npm install", { stdio: "inherit" });

step("Apply database migrations (prisma migrate deploy)");
execSync("cd server && npx prisma migrate deploy", { stdio: "inherit" });

step("Build frontend (user app + admin)");
execSync("npm run build", { stdio: "inherit" });

step("Start LabShare server");
execSync("cd server && npm start", { stdio: "inherit" });
