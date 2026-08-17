// LabShare — production entrypoint.
//
// Render runs `node start.js` and gets a fully ready app in one command:
//   1. install backend deps (server/)
//   2. apply Prisma migrations in production (non-interactive)
//   3. build the Vite frontend (user app + admin) into dist/
//   4. start the Express server (which also serves dist/ statically)
//
// Local dev still uses the separate `npm run dev` (Vite) + `cd server && npm run dev`.

import { execSync } from "node:child_process";

const step = (msg) => console.log(`\n==> ${msg}`);

step("Install backend dependencies (server/)");
execSync("cd server && npm install --omit=dev", { stdio: "inherit" });

step("Apply database migrations (prisma migrate deploy)");
execSync("cd server && npx prisma migrate deploy", { stdio: "inherit" });

step("Build frontend (user app + admin)");
execSync("npm run build", { stdio: "inherit" });

step("Start LabShare server");
execSync("cd server && npm start", { stdio: "inherit" });
