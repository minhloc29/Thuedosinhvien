import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import prisma from "./prisma.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import pickupPointsRouter from "./routes/pickupPoints.js";
import categoriesRouter from "./routes/categories.js";
import consignmentsRouter from "./routes/consignments.js";
import adminRouter from "./routes/admin.js";
import bookingsRouter from "./routes/bookings.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health + root probe.
app.get("/", (req, res) => res.json({ service: "labshare-api", ok: true }));

// Phase 1: Auth.
app.use("/auth", authRouter);

// Phase 2: Catalog (products read-only + pickup points + categories).
// Mounted under /api so the frontend Vite proxy forwards /api/* -> :4000.
app.use("/api/products", productsRouter);
app.use("/api/pickup-points", pickupPointsRouter);
app.use("/api/categories", categoriesRouter);

// Phase 3: Consignment (senior) + Admin appraisal.
app.use("/api/consignments", consignmentsRouter);
app.use("/api/admin", adminRouter);

// Phase 4: Booking (renter) + admin confirm/handover/return.
app.use("/api/bookings", bookingsRouter);

// Production: serve the built frontend (dist/) alongside the API so a single
// Render Web Service hosts both the UI and the API on one origin. The Vite
// build emits both index.html (user app) and admin.html into dist/. Skipped
// when no build exists yet (pure-API/dev runs keep working untouched).
const dist = path.resolve(__dirname, "../../dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  // SPA fallback: any non-API, non-asset path (e.g. deep links, /admin.html
  // handled by express.static; unknown routes) resolves to the user app HTML.
  app.get(/^\/(?!api\/|auth\/|assets\/).*/, (req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LabShare API listening on http://localhost:${PORT}`);
});

// Graceful shutdown.
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
