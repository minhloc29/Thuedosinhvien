import { Router } from "express";
import prisma from "../prisma.js";

// GET /api/categories
const router = Router();
router.get("/", async (_req, res) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { id: "asc" } });
    return res.json({ categories: cats });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
