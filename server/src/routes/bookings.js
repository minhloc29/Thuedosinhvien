import { Router } from "express";
import prisma from "../prisma.js";
import { authRequired } from "../auth.js";

const router = Router();
router.use(authRequired);

// Business rules (match frontend + spec mục 3/4).
export const INSURANCE_FEE = 15000;
export const DEPOSIT_RATE = 0.65;
export const depositFor = (product) => Math.round(product.marketValue * DEPOSIT_RATE);

function toApi(b) {
  return {
    id: b.id,
    product: b.product ? { id: b.product.id, sealCode: b.product.sealCode, name: b.product.name, emoji: b.product.category?.emoji, pricePerDay: b.product.pricePerDay, splitSeniorPct: b.product.splitSeniorPct, splitPlatformPct: b.product.splitPlatformPct } : null,
    renterName: b.renter?.name,
    pickupId: b.pickupPointId,
    pickupName: b.pickupPoint?.name,
    start: b.startDate.toISOString().slice(0, 10),
    end: b.endDate.toISOString().slice(0, 10),
    nights: b.nights,
    rentalCost: b.rentalCost,
    deposit: b.deposit,
    insuranceFee: b.insuranceFee,
    total: b.total,
    status: b.status,
    handoverStage: b.handoverAt ? "picked_up" : null,
    handoverAt: b.handoverAt,
    returnAt: b.returnAt,
    depositReturned: b.depositReturned,
    createdAt: b.createdAt,
  };
}

// POST /api/bookings  { productId, pickupId, startDate, endDate }
// Computes nights, rentalCost, deposit, insurance, total server-side
// (never trust the client for money). Booking starts as "pending".
router.post("/", async (req, res) => {
  try {
    const { productId, pickupId, startDate, endDate } = req.body || {};
    if (!productId || !pickupId || !startDate || !endDate) {
      return res.status(400).json({ error: "productId, pickupId, startDate, endDate are required" });
    }

    const product = await prisma.product.findFirst({ where: { OR: [{ id: String(productId) }, { sealCode: String(productId) }] } });
    if (!product || product.status !== "active") return res.status(404).json({ error: "Product not available" });

    const point = await prisma.pickupPoint.findUnique({ where: { id: String(pickupId) } });
    if (!point) return res.status(400).json({ error: "Unknown pickup point" });

    const start = new Date(String(startDate));
    const end = new Date(String(endDate));
    if (isNaN(start) || isNaN(end) || end <= start) return res.status(400).json({ error: "Invalid date range" });
    const nights = Math.round((end - start) / 86400000);

    if (product.seniorId === req.userId) return res.status(400).json({ error: "Không thể thuê thiết bị của chính mình" });

    const rentalCost = nights * product.pricePerDay;
    const deposit = depositFor(product);
    const insuranceFee = INSURANCE_FEE;

    const booking = await prisma.booking.create({
      data: {
        productId: product.id,
        renterId: req.userId,
        pickupPointId: point.id,
        startDate: start, endDate: end, nights,
        rentalCost, deposit, insuranceFee,
        total: rentalCost + deposit + insuranceFee,
        status: "pending",
      },
      include: { product: { include: { category: true } }, renter: true, pickupPoint: true },
    });
    return res.status(201).json({ booking: toApi(booking) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/bookings  — the caller's own bookings
router.get("/", async (req, res) => {
  try {
    const list = await prisma.booking.findMany({
      where: { renterId: req.userId },
      include: { product: { include: { category: true } }, renter: true, pickupPoint: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ bookings: list.map(toApi) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
