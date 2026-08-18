import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Transform a Prisma Product row into the shape the frontend components expect
// (merging category emoji/label + senior name, parsing JSON-string fields).
function toApi(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.categoryId,
    categoryLabel: product.category?.label,
    emoji: product.category?.emoji,
    image: product.image,
    price: product.pricePerDay,
    marketValue: product.marketValue,
    grade: product.grade,
    rating: product.rating,
    rentedCount: product.rentedCount,
    earnedSoFar: product.earnedSoFar,
    seniorName: product.senior?.name,
    sealCode: product.sealCode,
    appraisedDate: product.appraisedAt?.toISOString().slice(0, 10).split("-").reverse().join("/"),
    lastTestedDate: product.lastTestedAt?.toISOString().slice(0, 10).split("-").reverse().join("/"),
    desc: product.desc,
    specs: JSON.parse(product.specs || "[]"),
    included: JSON.parse(product.included || "[]"),
    notIncluded: JSON.parse(product.notIncluded || "[]"),
    unavailableDays: JSON.parse(product.unavailableDays || "[]"),
    splitSenior: product.splitSeniorPct,
    splitPlatform: product.splitPlatformPct,
    status: product.status,
  };
}

// GET /api/products?category=&maxPrice=&query=&projectBundle=
// projectBundle is a convenience filter mapping a bundle id to its product ids,
// mirroring the frontend PROJECT_BUNDLES. Implemented server-side for API users;
// the React app keeps its own client-side filter to avoid refetch churn.
const PROJECT_BUNDLES = {
  iot: ["p4", "p6", "p8"].map(_ => null), // resolved against seeded sealCodes below
};

const BUNDLE_SEALS = {
  iot: ["LS-0212", "LS-0219", "LS-0207"],         // Arduino, RPi, Logic Analyzer
  doan: ["LS-0198", "LS-0201", "LS-0155"],        // Oscilloscope, FuncGen, Nguồn tổ ong
  onthi: ["LS-0201", "LS-0155"],                  // FuncGen, Nguồn tổ ong
  robocon: ["LS-0233", "LS-0155"],                // PLC, Nguồn tổ ong
};

router.get("/", async (req, res) => {
  try {
    const { category, maxPrice, query, projectBundle } = req.query;
    const where = { status: "active" };

    if (projectBundle) {
      const seals = BUNDLE_SEALS[projectBundle];
      if (seals) where.sealCode = { in: seals };
    }
    if (category) where.categoryId = String(category);
    if (maxPrice) where.pricePerDay = { lte: Number(maxPrice) };
    if (query) {
      where.OR = [
        { name: { contains: String(query) } },
        { desc: { contains: String(query) } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true, senior: true },
      orderBy: { rentedCount: "desc" },
    });
    return res.json({ products: products.map(toApi) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/products/:code — the frontend references products by sealCode
// (e.g. "LS-0198") in URLs, and by cuid id internally. Match either.
router.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const product = await prisma.product.findFirst({
      where: { OR: [{ sealCode: code }, { id: code }] },
      include: { category: true, senior: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json({ product: toApi(product) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
