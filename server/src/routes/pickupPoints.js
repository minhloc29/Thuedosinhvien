import { Router } from "express";
import prisma from "../prisma.js";

// GET /api/pickup-points
const router = Router();
router.get("/", async (_req, res) => {
  try {
    const points = await prisma.pickupPoint.findMany({ orderBy: { name: "asc" } });
    return res.json({ points });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
