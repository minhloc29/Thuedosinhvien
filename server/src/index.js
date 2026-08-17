import "dotenv/config";
import express from "express";
import cors from "cors";

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

// Mount point for later phases (kept explicit so route files register here):
// app.use("/products", productRouter);
// app.use("/consignments", consignmentRouter);
// ...

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LabShare API listening on http://localhost:${PORT}`);
});

// Graceful shutdown.
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
