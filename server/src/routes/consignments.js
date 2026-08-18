import { Router } from "express";
import prisma from "../prisma.js";
import { authRequired } from "../auth.js";

const router = Router();
router.use(authRequired);

function toApi(c) {
  return {
    id: c.id,
    name: c.name,
    category: c.categoryId,
    categoryLabel: c.category?.label,
    emoji: c.category?.emoji,
    seniorName: c.senior?.name,
    estimatedValue: c.estimatedValue,
    desc: c.desc,
    contactName: c.contactName,
    contactPhone: c.contactPhone,
    status: c.status,
    dateSubmitted: c.submittedAt.toISOString().slice(0, 10).split("-").reverse().join("/"),
    productId: c.productId,
  };
}

// POST /api/consignments  { name, category, estimatedValue, desc }
router.post("/", async (req, res) => {
  try {
    const { name, category, estimatedValue, desc, contactName, contactPhone } = req.body || {};
    if (!name || !category || !estimatedValue || Number(estimatedValue) <= 0) {
      return res.status(400).json({ error: "name, category, estimatedValue are required" });
    }
    const cat = await prisma.category.findUnique({ where: { id: String(category) } });
    if (!cat) return res.status(400).json({ error: "Unknown category" });

    const c = await prisma.consignment.create({
      data: {
        name: String(name).trim(),
        categoryId: cat.id,
        seniorId: req.userId,
        estimatedValue: Number(estimatedValue),
        desc: String(desc || "").trim() || "Chưa có mô tả chi tiết.",
        contactName: contactName ? String(contactName).trim() : null,
        contactPhone: contactPhone ? String(contactPhone).trim() : null,
      },
      include: { category: true, senior: true },
    });
    return res.status(201).json({ consignment: toApi(c) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/consignments  — the caller's own consignment submissions
router.get("/", async (req, res) => {
  try {
    const list = await prisma.consignment.findMany({
      where: { seniorId: req.userId },
      include: { category: true, senior: true },
      orderBy: { submittedAt: "desc" },
    });
    return res.json({ consignments: list.map(toApi) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
