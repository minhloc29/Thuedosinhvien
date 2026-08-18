import { Router } from "express";
import prisma from "../prisma.js";
import { authRequired, adminRequired } from "../auth.js";

const router = Router();
// authRequired first (sets req.userId + req.isAdmin), then adminRequired gates.
router.use(authRequired, adminRequired);

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

// GET /api/admin/consignments?status=pending|approved|rejected  → appraisal queue
router.get("/consignments", async (req, res) => {
  try {
    const status = req.query.status;
    const list = await prisma.consignment.findMany({
      where: status ? { status: String(status) } : {},
      include: { category: true, senior: true },
      orderBy: { submittedAt: "desc" },
    });
    return res.json({ consignments: list.map(toApi) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/consignments/:id/approve
// Body: { grade, price, marketValue, splitSenior, splitPlatform, sealCode }
// Transitions pending → approved, creates the Product, links consignment.
router.post("/consignments/:id/approve", async (req, res) => {
  try {
    const { grade, price, marketValue, splitSenior, splitPlatform, sealCode } = req.body || {};

    const consignment = await prisma.consignment.findUnique({
      where: { id: req.params.id },
      include: { category: true, senior: true },
    });
    if (!consignment) return res.status(404).json({ error: "Consignment not found" });
    if (consignment.status !== "pending") return res.status(409).json({ error: "Already reviewed" });

    if (!grade || !price || !marketValue || !sealCode) {
      return res.status(400).json({ error: "grade, price, marketValue, sealCode are required" });
    }
    if (splitSenior == null) {
      // Defaults per spec: marketValue > 2M → 60/40, else 50/50 (Admin range 40–70).
      const split = marketValue > 2000000 ? 60 : 50;
      req.body.splitSenior = split;
    }
    const sp = Number(req.body.splitSenior);

    const existing = await prisma.product.findUnique({ where: { sealCode: String(sealCode) } });
    if (existing) return res.status(409).json({ error: "Seal code already in use" });

    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name: consignment.name,
          categoryId: consignment.categoryId,
          pricePerDay: Number(price),
          marketValue: Number(marketValue),
          grade: String(grade),
          sealCode: String(sealCode),
          seniorId: consignment.seniorId,
          splitSeniorPct: sp,
          splitPlatformPct: 100 - sp,
          appraisedAt: new Date(),
          lastTestedAt: new Date(),
          desc: consignment.desc,
          specs: JSON.stringify([{ label: "Tình trạng", value: "Đã kiểm tra khi ký gửi" }]),
          included: JSON.stringify([]),
          notIncluded: JSON.stringify([]),
          unavailableDays: JSON.stringify([]),
        },
      });
      await tx.consignment.update({
        where: { id: consignment.id },
        data: { status: "approved", reviewedAt: new Date(), productId: prod.id },
      });
      return prod;
    });

    return res.json({
      product: { id: product.id, sealCode: product.sealCode, name: product.name },
      consignmentId: consignment.id,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/consignments/:id/reject
router.post("/consignments/:id/reject", async (req, res) => {
  try {
    const consignment = await prisma.consignment.findUnique({ where: { id: req.params.id } });
    if (!consignment) return res.status(404).json({ error: "Consignment not found" });
    if (consignment.status !== "pending") return res.status(409).json({ error: "Already reviewed" });

    await prisma.consignment.update({
      where: { id: consignment.id },
      data: { status: "rejected", reviewedAt: new Date() },
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// ---------------------------------------------------------------------------
// Phase 4 — Admin booking flow: queue, confirm/reject, handover, return.
// ---------------------------------------------------------------------------

function bookingApi(b) {
  return {
    id: b.id,
    product: b.product ? { id: b.product.id, sealCode: b.product.sealCode, name: b.product.name, emoji: b.product.category?.emoji, image: b.product.image, pricePerDay: b.product.pricePerDay, splitSeniorPct: b.product.splitSeniorPct, splitPlatformPct: b.product.splitPlatformPct } : null,
    renterName: b.renter?.name,
    pickupId: b.pickupPointId, pickupName: b.pickupPoint?.name,
    start: b.startDate.toISOString().slice(0, 10), end: b.endDate.toISOString().slice(0, 10),
    nights: b.nights, rentalCost: b.rentalCost, deposit: b.deposit,
    insuranceFee: b.insuranceFee, total: b.total, status: b.status,
    contactName: b.contactName, contactPhone: b.contactPhone,
    handoverStage: b.handoverAt ? "picked_up" : null,
    handoverAt: b.handoverAt, returnAt: b.returnAt, depositReturned: b.depositReturned,
    createdAt: b.createdAt,
  };
}

// GET /api/admin/bookings?status=
router.get("/bookings", async (req, res) => {
  try {
    const status = req.query.status;
    const list = await prisma.booking.findMany({
      where: status ? { status: String(status) } : {},
      include: { product: { include: { category: true } }, renter: true, pickupPoint: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ bookings: list.map(bookingApi) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/bookings/:id/confirm  (pending → confirmed)
router.post("/bookings/:id/confirm", async (req, res) => {
  try {
    const b = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!b) return res.status(404).json({ error: "Booking not found" });
    if (b.status !== "pending") return res.status(409).json({ error: `Cannot confirm a ${b.status} booking` });
    await prisma.booking.update({ where: { id: b.id }, data: { status: "confirmed" } });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/bookings/:id/reject  (pending → rejected)
router.post("/bookings/:id/reject", async (req, res) => {
  try {
    const b = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!b) return res.status(404).json({ error: "Booking not found" });
    if (b.status !== "pending") return res.status(409).json({ error: `Cannot reject a ${b.status} booking` });
    await prisma.booking.update({ where: { id: b.id }, data: { status: "rejected" } });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/bookings/:id/handover  (confirmed → picked_up; set handoverAt)
router.post("/bookings/:id/handover", async (req, res) => {
  try {
    const b = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { product: { include: { category: true } }, renter: true, pickupPoint: true },
    });
    if (!b) return res.status(404).json({ error: "Booking not found" });
    if (b.status !== "confirmed") return res.status(409).json({ error: `Cannot hand over a ${b.status} booking` });
    const updated = await prisma.booking.update({
      where: { id: b.id }, data: { status: "picked_up", handoverAt: new Date() },
      include: { product: { include: { category: true } }, renter: true, pickupPoint: true },
    });
    return res.json({ booking: bookingApi(updated) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/admin/bookings/:id/return  (picked_up → completed + LedgerEntry)
// The return checklist gate happens on the client (all boxes checked); here we
// finalize: release the deposit (spec: only after the return checklist, never
// auto), mark returnAt, and book every ledger line for this rental in one txn.
router.post("/bookings/:id/return", async (req, res) => {
  try {
    const b = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!b) return res.status(404).json({ error: "Booking not found" });
    if (b.status !== "picked_up") return res.status(409).json({ error: `Cannot return a ${b.status} booking` });

    const prod = await prisma.product.findUnique({
      where: { id: b.productId },
      include: { category: true },
    });

    const seniorSharePct = prod?.splitSeniorPct ?? 50;
    const seniorPayout = Math.round(b.rentalCost * seniorSharePct / 100);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: b.id },
        data: { status: "completed", returnAt: new Date(), depositReturned: true },
      }),
      prisma.product.update({
        where: { id: b.productId },
        data: { rentedCount: { increment: 1 }, earnedSoFar: { increment: b.rentalCost } },
      }),
      // Ledger entries (chart of accounts per spec mục 6):
      prisma.ledgerEntry.create({ data: { type: "rental_revenue", amount: b.rentalCost, bookingId: b.id, productId: b.productId, note: "Phí thuê" } }),
      prisma.ledgerEntry.create({ data: { type: "insurance_fee", amount: b.insuranceFee, bookingId: b.id, productId: b.productId, note: "Phí bảo hiểm" } }),
      prisma.ledgerEntry.create({ data: { type: "deposit_hold", amount: b.deposit, bookingId: b.id, productId: b.productId, note: "Giữ cọc (tạm giữ)" } }),
      prisma.ledgerEntry.create({ data: { type: "deposit_release", amount: b.deposit, bookingId: b.id, productId: b.productId, note: "Hoàn cọc sau checklist trả đồ" } }),
      prisma.ledgerEntry.create({ data: { type: "senior_payout", amount: seniorPayout, bookingId: b.id, productId: b.productId, note: `Chia sẻ senior ${seniorSharePct}%` } }),
    ]);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// ---------------------------------------------------------------------------
// Phase 5 — Ledger + overview stats.
// ---------------------------------------------------------------------------

// GET /api/admin/ledger?type=&limit= — raw chart-of-accounts lines.
router.get("/ledger", async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = String(req.query.type);
    const limit = req.query.limit ? Math.min(Number(req.query.limit), 500) : 200;
    const rows = await prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return res.json({ ledger: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/admin/stats — aggregated numbers for the overview dashboard.
// All figures computed from the ledger where possible:
//   realizedRevenue = Σ rental_revenue;  insuranceFund = Σ insurance_fee
//   seniorPaidOut   = Σ senior_payout;   depositsHeld = Σ deposit_hold − Σ deposit_release
// Plus live counts from products/bookings.
router.get("/stats", async (_req, res) => {
  try {
    const [rental, insurance, senior, hold, release, products, activeBookings, pendingAppraisals] = await Promise.all([
      prisma.ledgerEntry.aggregate({ where: { type: "rental_revenue" }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { type: "insurance_fee" }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { type: "senior_payout" }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { type: "deposit_hold" }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { type: "deposit_release" }, _sum: { amount: true } }),
      prisma.product.count({ where: { status: "active" } }),
      prisma.booking.count({ where: { status: { in: ["pending", "confirmed", "picked_up"] } } }),
      prisma.consignment.count({ where: { status: "pending" } }),
    ]);

    return res.json({
      stats: {
        activeItems: products,
        activeBookings,
        pendingAppraisals,
        realizedRevenue: rental._sum.amount || 0,
        insuranceFund: insurance._sum.amount || 0,
        seniorPaidOut: senior._sum.amount || 0,
        depositsHeld: (hold._sum.amount || 0) - (release._sum.amount || 0),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
