// Seed script — creates the same demo data as the frontend prototype
// (8 products, pending consignments, sample bookings, pickup points, categories),
// plus a few demo users (renter / senior / admin) so the API is usable immediately.
//
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Constants (must match frontend business rules) -----------------------
const INSURANCE_FEE = 15000;
const DEPOSIT_RATE = 0.65;

const CATS = [
  { id: "do-luong", label: "Đo lường", emoji: "📟" },
  { id: "vi-dieu-khien", label: "Vi điều khiển", emoji: "🔧" },
  { id: "plc", label: "PLC/Tự động hoá", emoji: "⚙️" },
  { id: "khac", label: "Khác", emoji: "🧰" },
];

const PICKUP_POINTS = [
  { id: "ktx-b2", name: "KTX Bách Khoa – Nhà B2", hours: "07:00–21:00" },
  { id: "ktx-b9", name: "KTX Bách Khoa – Nhà B9", hours: "07:00–21:00" },
  { id: "c7", name: "Sảnh nhà C7 – Bách Khoa", hours: "08:00–18:00" },
  { id: "ta-quang-buu", name: "Ngõ 42 Tạ Quang Bửu (CTV Minh)", hours: "17:00–22:00" },
  { id: "me-tri", name: "KTX Mễ Trì – ĐHQGHN", hours: "07:00–21:00" },
];

// Match the frontend SEED_PRODUCTS (name, category, price, marketValue, grade).
// Detail (specs/included/notIncluded/desc/unavailableDays) mirrors the frontend
// SEED_PRODUCTS arrays so the API returns the same rich shape the UI already renders.
const SEED_PRODUCTS = [
  {
    name: "Oscilloscope Rigol DS1102Z-E", categoryId: "do-luong", pricePerDay: 90000, marketValue: 9000000, grade: "A", sealCode: "LS-0198", splitSeniorPct: 60, seniorKey: "ducanh", image: "/images/products/oscilloscope.jpg",
    rating: 4.9, rentedCount: 18, earnedSoFar: 540000,
    desc: "Máy hiện sóng số 2 kênh 100MHz, đã hiệu chuẩn, dùng tốt cho project đo đạc mạch điện tử.",
    specs: [
      { label: "Băng thông", value: "100 MHz" },
      { label: "Số kênh", value: "2 kênh" },
      { label: "Tốc độ lấy mẫu", value: "1 GSa/s" },
      { label: "Màn hình", value: "7 inch TFT" },
      { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" },
    ],
    included: ["Dây đo 2 kênh", "Dây nối đất", "Cáp nguồn", "Sách hướng dẫn"],
    notIncluded: ["Bộ đổi nguồn adapter ngoài"],
    unavailableDays: ["2026-08-20", "2026-08-21"],
  },
  {
    name: "Function Generator FY6900", categoryId: "do-luong", pricePerDay: 60000, marketValue: 3500000, grade: "A", sealCode: "LS-0201", splitSeniorPct: 60, seniorKey: "ducanh", image: "/images/products/function-gen.jpg",
    rating: 4.8, rentedCount: 12, earnedSoFar: 360000,
    desc: "Máy phát hàm 2 kênh 60MHz, sinh sin/vuông/tam giác — ghép với oscilloscope để build project đo đạc.",
    specs: [{ label: "Tần số tối đa", value: "60 MHz" }, { label: "Số kênh", value: "2 kênh" }, { label: "Dạng sóng", value: "Sin / Square / Triangle" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["Cáp BNC", "Cáp nguồn"],
    notIncluded: [],
    unavailableDays: [],
  },
  {
    name: "Nguồn tổ ong DC 30V/5A", categoryId: "do-luong", pricePerDay: 35000, marketValue: 1200000, grade: "B", sealCode: "LS-0155", splitSeniorPct: 50, seniorKey: "thutrang", image: "/images/products/power-supply.jpg",
    rating: 4.7, rentedCount: 22, earnedSoFar: 385000,
    desc: "Nguồn một chiều điều chỉnh 0–30V / 5A, hiển thị số, dùng để cấp nguồn cho mạch khi test.",
    specs: [{ label: "Điện áp", value: "0–30V" }, { label: "Dòng", value: "0–5A" }, { label: "Hiển thị", value: "LED số 2 line" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["Dây nguồn", "Dây chuối 2 đầu"],
    notIncluded: ["Kẹp cá sấu bổ sung"],
    unavailableDays: [],
  },
  {
    name: "Kit Arduino Uno R3 + 10 cảm biến", categoryId: "vi-dieu-khien", pricePerDay: 25000, marketValue: 650000, grade: "A", sealCode: "LS-0212", splitSeniorPct: 60, seniorKey: "minhquan", image: "/images/products/arduino.jpg",
    rating: 4.9, rentedCount: 35, earnedSoFar: 437000,
    desc: "Board Arduino Uno R3 chính hãng kèm 10 cảm biến thông dụng (DHT11, siêu âm, LDR, …) — đủ cho project IoT nhập môn.",
    specs: [{ label: "Vi điều khiển", value: "ATmega328P" }, { label: "Cảm biến kèm", value: "10 loại" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["10 cảm biến", "Breadboard", "Dây nối 40 chiếc", "Cáp USB"],
    notIncluded: ["ESP8266 WiFi shield"],
    unavailableDays: [],
  },
  {
    name: "Kit STM32F103C8T6 (Blue Pill)", categoryId: "vi-dieu-khien", pricePerDay: 20000, marketValue: 450000, grade: "B", sealCode: "LS-0225", splitSeniorPct: 50, seniorKey: "minhquan", image: "/images/products/stm32.jpg",
    rating: 4.7, rentedCount: 20, earnedSoFar: 200000,
    desc: "Board Blue Pill STM32F103C8T6, lập trình bằng Arduino IDE, đủ tài nguyên cho project nhúng nâng cao.",
    specs: [{ label: "Vi điều khiển", value: "STM32F103C8T6" }, { label: "Tần số", value: "72 MHz" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["ST-Link nạp", "Cáp USB"],
    notIncluded: ["Breadboard"],
    unavailableDays: [],
  },
  {
    name: "Raspberry Pi 4 Model B (4GB)", categoryId: "vi-dieu-khien", pricePerDay: 40000, marketValue: 1800000, grade: "A", sealCode: "LS-0219", splitSeniorPct: 60, seniorKey: "thutrang", image: "/images/products/raspberrypi.jpg",
    rating: 4.8, rentedCount: 15, earnedSoFar: 300000,
    desc: "Raspberry Pi 4 4GB chạy ổn định, kèm nguồn + thẻ nhớ đã cài hệ điều hành — cho project IoT/machine learning edge.",
    specs: [{ label: "CPU", value: "BCM2711 4 nhân" }, { label: "RAM", value: "4 GB" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["Nguồn chính hãng 15W", "Thẻ nhớ 32GB", "Tản nhiệt"],
    notIncluded: ["Màn hình / bàn phím"],
    unavailableDays: ["2026-08-22"],
  },
  {
    name: "Kit PLC Mini Siemens LOGO!", categoryId: "plc", pricePerDay: 70000, marketValue: 4500000, grade: "A", sealCode: "LS-0233", splitSeniorPct: 60, seniorKey: "ducanh", image: "/images/products/plc.jpg",
    rating: 4.9, rentedCount: 8, earnedSoFar: 280000,
    desc: "PLC Siemens LOGO! 8DI/4DO, kèm cáp lập trình + mô phỏng — cho project tự động hoá mini.",
    specs: [{ label: "Hãng", value: "Siemens" }, { label: "Ngõ vào/ra", value: "8DI / 4DO" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["Cáp lập trình", "Nguồn 24V"],
    notIncluded: ["HMI panel"],
    unavailableDays: [],
  },
  {
    name: "Logic Analyzer 8-channel USB", categoryId: "do-luong", pricePerDay: 30000, marketValue: 550000, grade: "B", sealCode: "LS-0207", splitSeniorPct: 50, seniorKey: "thutrang", image: "/images/products/logic-analyzer.jpg",
    rating: 4.6, rentedCount: 14, earnedSoFar: 210000,
    desc: "Logic analyzer 8 kênh USB, phần mềm Saleae — bắt tín hiệu nối tiếp UART/I2C/SPI khi debug firmware.",
    specs: [{ label: "Số kênh", value: "8" }, { label: "Kết nối", value: "USB (Saleae)" }, { label: "Tình trạng", value: "Đã kiểm tra khi thẩm định" }],
    included: ["Dây cắm 8 kênh"],
    notIncluded: ["Software (download miễn phí)"],
    unavailableDays: [],
  },
];

// Pending consignments (matching frontend seedConsignments).
const SEED_CONSIGNMENTS = [
  { name: "Kit ESP32 DevKit + màn OLED", categoryId: "vi-dieu-khien", estimatedValue: 350000, seniorKey: "hainam", desc: "Bộ ESP32 kèm màn OLED 0.96 inch, đã test WiFi/Bluetooth ổn định.", status: "pending" },
  { name: "Multimeter Fluke 17B+", categoryId: "do-luong", estimatedValue: 2200000, seniorKey: "ducanh", desc: "Đồng hồ vạn năng Fluke, đo chính xác, còn bảo hành hãng.", status: "pending" },
];

const d = (s) => new Date(s);

async function main() {
  console.log("Seeding LabShare DB…");

  // Categories
  for (const c of CATS) await prisma.category.upsert({ where: { id: c.id }, update: {}, create: c });

  // Pickup points
  for (const p of PICKUP_POINTS) await prisma.pickupPoint.upsert({ where: { id: p.id }, update: {}, create: p });

  // Users (password: "password123" for all)
  const pass = await bcrypt.hash("password123", 10);
  const users = {
    minhquan: await prisma.user.upsert({ where: { email: "minhquan@bk.edu.vn" }, update: {}, create: { name: "Minh Quân (K67)", studentId: "2023A001", email: "minhquan@bk.edu.vn", phone: "091 123 4567", passwordHash: pass, isAdmin: false } }),
    thutrang: await prisma.user.upsert({ where: { email: "thutrang@bk.edu.vn" }, update: {}, create: { name: "Thu Trang (K65)", studentId: "2021A502", email: "thutrang@bk.edu.vn", phone: "090 234 5678", passwordHash: pass, isAdmin: false } }),
    ducanh: await prisma.user.upsert({ where: { email: "ducanh@bk.edu.vn" }, update: {}, create: { name: "Đức Anh (K66)", studentId: "2022A310", email: "ducanh@bk.edu.vn", phone: "098 345 6789", passwordHash: pass, isAdmin: false } }),
    hainam: await prisma.user.upsert({ where: { email: "hainam@bk.edu.vn" }, update: {}, create: { name: "Hải Nam (K66)", studentId: "2022A118", email: "hainam@bk.edu.vn", phone: "097 456 7890", passwordHash: pass, isAdmin: false } }),
    admin: await prisma.user.upsert({ where: { email: "admin@labshare.vn" }, update: {}, create: { name: "LabShare Admin", email: "admin@labshare.vn", phone: null, passwordHash: pass, isAdmin: true } }),
  };

  // Products (senior-owned, active)
  for (const p of SEED_PRODUCTS) {
    const senior = users[p.seniorKey];
    await prisma.product.upsert({
      where: { sealCode: p.sealCode },
      update: { image: p.image },
      create: {
        name: p.name, categoryId: p.categoryId, pricePerDay: p.pricePerDay, marketValue: p.marketValue,
        grade: p.grade, sealCode: p.sealCode, seniorId: senior.id, splitSeniorPct: p.splitSeniorPct,
        splitPlatformPct: 100 - p.splitSeniorPct, rating: p.rating ?? 4.8, rentedCount: p.rentedCount ?? 0,
        earnedSoFar: p.earnedSoFar ?? 0, desc: p.desc,
        image: p.image,
        specs: JSON.stringify(p.specs), included: JSON.stringify(p.included),
        notIncluded: JSON.stringify(p.notIncluded), unavailableDays: JSON.stringify(p.unavailableDays ?? []),
        appraisedAt: d("2026-08-05"), lastTestedAt: d("2026-08-12"),
      },
    });
  }

  // Consignments (pending)
  for (const c of SEED_CONSIGNMENTS) {
    const senior = users[c.seniorKey];
    await prisma.consignment.create({
      data: { name: c.name, categoryId: c.categoryId, seniorId: senior.id, estimatedValue: c.estimatedValue, desc: c.desc, status: "pending", submittedAt: d("2026-08-15") },
    });
  }

  // Sample bookings (2, matching frontend seedBookings)
  const osc = await prisma.product.findUnique({ where: { sealCode: "LS-0198" } });
  const rpi = await prisma.product.findUnique({ where: { sealCode: "LS-0219" } });
  if (osc) {
    const nights = 2, deposit = Math.round(osc.marketValue * DEPOSIT_RATE);
    await prisma.booking.create({
      data: { productId: osc.id, renterId: users.minhquan.id, pickupPointId: "ktx-b2", startDate: d("2026-08-18"), endDate: d("2026-08-20"), nights, rentalCost: nights * osc.pricePerDay, deposit, insuranceFee: INSURANCE_FEE, total: nights * osc.pricePerDay + deposit + INSURANCE_FEE, status: "pending" },
    });
  }
  if (rpi) {
    const nights = 2, deposit = Math.round(rpi.marketValue * DEPOSIT_RATE);
    await prisma.booking.create({
      data: { productId: rpi.id, renterId: users.thutrang.id, pickupPointId: "c7", startDate: d("2026-08-10"), endDate: d("2026-08-12"), nights, rentalCost: nights * rpi.pricePerDay, deposit, insuranceFee: INSURANCE_FEE, total: nights * rpi.pricePerDay + deposit + INSURANCE_FEE, status: "confirmed", handoverAt: d("2026-08-10") },
    });
  }

  console.log("Seeding complete.");
  console.log("Demo logins (password: password123):");
  console.log("  renter/senior: minhquan@bk.edu.vn");
  console.log("  renter:        thutrang@bk.edu.vn");
  console.log("  senior:        ducanh@bk.edu.vn / hainam@bk.edu.vn");
  console.log("  admin:         admin@labshare.vn");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
