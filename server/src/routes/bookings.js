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
    product: b.product ? { id: b.product.id, sealCode: b.product.sealCode, name: b.product.name, emoji: b.product.category?.emoji, image: b.product.image, pricePerDay: b.product.pricePerDay, splitSeniorPct: b.product.splitSeniorPct, splitPlatformPct: b.product.splitPlatformPct } : null,
    renterName: b.renter?.name,
    pickupId: b.pickupPointId,
    pickupName: b.pickupName || b.pickupPoint?.name,
    start: b.startDate.toISOString().slice(0, 10),
    end: b.endDate.toISOString().slice(0, 10),
    nights: b.nights,
    weeks: b.weeks,
    rentalCost: b.rentalCost,
    deposit: b.deposit,
    insuranceFee: b.insuranceFee,
    total: b.total,
    contactName: b.contactName,
    contactPhone: b.contactPhone,
    status: b.status,
    handoverStage: b.handoverAt ? "picked_up" : null,
    handoverAt: b.handoverAt,
    returnAt: b.returnAt,
    depositReturned: b.depositReturned,
    createdAt: b.createdAt,
  };
}

// POST /api/bookings  { productId, pickupId, startDate, weeks }  (+ contact)
// Products rent by the WEEK: min 1, options 1/2/3 weeks. Price is per week, so
// rentalCost = weeks × pricePerDay (pricePerDay now means the weekly rate).
// Everything money-related is computed server-side (never trust the client).
// Booking starts as "pending".
router.post("/", async (req, res) => {
  try {
    const { productId, pickupId, pickupName, startDate, weeks, insured, contactName, contactPhone } = req.body || {};
    const weekCount = Number(weeks) || 1;
    if (!productId || !startDate || (!pickupId && !pickupName)) {
      return res.status(400).json({ error: "productId, startDate and a pickup location (pickupName or pickupId) are required" });
    }
    if (!Number.isInteger(weekCount) || weekCount < 1 || weekCount > 3) {
      return res.status(400).json({ error: "weeks must be an integer 1–3" });
    }

    const product = await prisma.product.findFirst({ where: { OR: [{ id: String(productId) }, { sealCode: String(productId) }] } });
    if (!product || product.status !== "active") return res.status(404).json({ error: "Product not available" });

    // Accept a free-text pickup location, or look up a known pickup point by id.
    let pickupPointId = null;
    if (pickupName) {
      pickupPointId = null;
    } else if (pickupId) {
      const point = await prisma.pickupPoint.findUnique({ where: { id: String(pickupId) } });
      if (!point) return res.status(400).json({ error: "Unknown pickup point" });
      pickupPointId = point.id;
    }
    const pickupLabel = pickupName ? String(pickupName).trim() : null;

    const start = new Date(String(startDate));
    if (isNaN(start)) return res.status(400).json({ error: "Invalid start date" });
    const end = new Date(start.getTime() + weekCount * 7 * 86400000);
    const nights = weekCount * 7;

    if (product.seniorId === req.userId) return res.status(400).json({ error: "Không thể thuê thiết bị của chính mình" });

    const rentalCost = weekCount * product.pricePerDay;
    const deposit = depositFor(product);
    const insuranceFee = insured === false ? 0 : INSURANCE_FEE;

    const booking = await prisma.booking.create({
      data: {
        productId: product.id,
        renterId: req.userId,
        pickupPointId,
        pickupName: pickupLabel,
        startDate: start, endDate: end, nights, weeks: weekCount,
        rentalCost, deposit, insuranceFee,
        total: rentalCost + deposit + insuranceFee,
        contactName: contactName ? String(contactName).trim() : null,
        contactPhone: contactPhone ? String(contactPhone).trim() : null,
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
