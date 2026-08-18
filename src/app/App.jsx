import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Plus, Check, X, HomeIcon, User, ShieldCheck, ArrowRight,
  Wallet, Package, Tag, Scale, MapPin, Star, StarBorder,
} from "../lib/icons";
import heroBg from "../assets/hero-bg1.jpg";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
.rm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.rm-scroll::-webkit-scrollbar-thumb { background: #D8DEE6; border-radius: 8px; }
.rm-shell { display: flex; min-height: 100vh; }
.rm-sidebar { width: 220px; flex-shrink: 0; }
.rm-main { flex: 1; min-width: 0; }
.rm-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
.rm-detail { display: grid; grid-template-columns: 1.5fr 1fr; gap: 28px; align-items: start; }
.rm-compare-grid { display: grid; gap: 14px; }
@media (max-width: 900px) {
  .rm-shell { flex-direction: column; }
  .rm-sidebar { width: 100%; }
  .rm-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .rm-detail { grid-template-columns: 1fr; }
}
@media (max-width: 560px) { .rm-grid { grid-template-columns: 1fr; } }
input[type=range] { accent-color: #F2A93B; }
`;

const T = {
  bg: "#EEF1F6", surface: "#FFFFFF", ink: "#161E33", inkSoft: "#5B6478", inkFaint: "#909AAE",
  accent: "#F2A93B", accentDeep: "#8A5A0D", accentBg: "#FDF0DA",
  teal: "#2A6F68", tealBg: "#E3F1EF", tealDeep: "#1B4B46",
  line: "#DCE1EA", danger: "#C1443C", dangerBg: "#FBEAE8",
  green: "#3C7A45", greenBg: "#E7F3E8",
  purple: "#5B4FA8", purpleBg: "#EBE8F7",
};
const F = {
  display: "'Fraunces', ui-serif, 'New York', Georgia, 'Times New Roman', serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};

const CATS = [
  { id: "do-luong", label: "Đo lường" },
  { id: "vi-dieu-khien", label: "Vi điều khiển" },
  { id: "plc", label: "PLC/Tự động hoá" },
  { id: "khac", label: "Khác" },
];
const catInfo = (id) => CATS.find((c) => c.id === id) || CATS[0];
const money = (n) => Math.round(n).toLocaleString("vi-VN") + "đ";
const moneyShort = (n) => (n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "tr" : Math.round(n / 1000) + "k");

// The signed-in identity. Updated on login; because login triggers a re-render,
// components reading these (MyConsignments, MyRentals, Profile…) pick up the
// real user's name. Falls back to a demo label before any login happens.
let CURRENT_USER = "Minh Quân (K67)";
let CURRENT_USER_RENTER_LABEL = "Bạn (Minh Quân - K67)";
let CURRENT_USER_PHONE = "";

// ---------------------------------------------------------------------------
// API helper (session-based). No auto-login: every call carries the token the
// user obtained on the AuthScreen. If there's no session (e.g. backend down),
// callers fall back to local state so the prototype still renders.
// ---------------------------------------------------------------------------
let SESSION_TOKEN = typeof localStorage !== "undefined" ? localStorage.getItem("labshare_token") || null : null;
// Persisted session user (name/isAdmin/email) so a refreshed app doesn't
// silently fall back to the default persona. Kept in sync with the token.
let SESSION_USER =
  typeof localStorage !== "undefined" ? (() => {
    try { return JSON.parse(localStorage.getItem("labshare_user") || "null"); }
    catch { return null; }
  })() : null;
function setSession(token, user) {
  SESSION_TOKEN = token;
  SESSION_USER = user || null;
  if (token) {
    localStorage.setItem("labshare_token", token);
    if (user) localStorage.setItem("labshare_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("labshare_token");
    localStorage.removeItem("labshare_user");
  }
  if (user) {
    CURRENT_USER = user.name;
    CURRENT_USER_RENTER_LABEL = `Bạn (${user.name})`;
    CURRENT_USER_PHONE = user.phone || "";
  }
}
function api(path, options = {}, body) {
  const opts = { headers: {}, ...options };
  if (body !== undefined) {
    opts.method = opts.method || "POST";
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (SESSION_TOKEN) opts.headers["Authorization"] = "Bearer " + SESSION_TOKEN;
  return fetch("/api" + path, opts).then((r) => {
    if (!r.ok) return r.json().then((j) => Promise.reject(new Error(j.error || "API error")));
    return r.status === 204 ? null : r.json();
  });
}
// Admin endpoints use the same session token; the backend gates them by role
// (403 for non-admin), and callers fall back to local state on failure.
const apiAdmin = api;

// ---------------------------------------------------------------------------
// Mock data — approved catalogue (already appraised & sealed by LabShare)
// ---------------------------------------------------------------------------
const SEED_PRODUCTS = [
  {
    id: "p1", name: "Oscilloscope Rigol DS1102Z-E", category: "do-luong", price: 90000,
    marketValue: 9000000, grade: "A", seniorName: "Đức Anh (K66)", rating: 4.9, rentedCount: 14,
    sealCode: "LS-0198", appraisedDate: "02/08/2026", lastTestedDate: "12/08/2026",
    desc: "Oscilloscope 2 kênh 100MHz, phù hợp đo tín hiệu số/analog cho đồ án và bài lab Điện tử.",
    specs: [
      { label: "Dải tần", value: "100MHz" }, { label: "Số kênh", value: "2 kênh" },
      { label: "Màn hình", value: "Hoạt động tốt, không sọc" }, { label: "Vỏ máy", value: "Trầy nhẹ ở góc" },
    ],
    included: ["Que đo x2", "Dây nguồn"], notIncluded: ["Túi đựng"],
    unavailableDays: [5, 6, 7, 20, 21], splitSenior: 60, splitPlatform: 40, earnedSoFar: 756000,
  },
  {
    id: "p2", name: "Function Generator FY6900", category: "do-luong", price: 60000,
    marketValue: 3500000, grade: "A", seniorName: "Đức Anh (K66)", rating: 4.8, rentedCount: 9,
    sealCode: "LS-0201", appraisedDate: "03/08/2026", lastTestedDate: "11/08/2026",
    desc: "Máy phát xung đa dạng sóng, dùng kiểm tra mạch tương tự/số cho bài lab.",
    specs: [
      { label: "Dải tần", value: "0–60MHz" }, { label: "Dạng sóng", value: "Sin/Vuông/Tam giác/Xung" },
      { label: "Màn hình", value: "Không lỗi điểm ảnh" }, { label: "Vỏ máy", value: "Như mới" },
    ],
    included: ["Dây BNC x1"], notIncluded: ["Que đo"],
    unavailableDays: [1, 2, 12, 13, 14], splitSenior: 60, splitPlatform: 40, earnedSoFar: 324000,
  },
  {
    id: "p3", name: "Nguồn tổ ong DC 30V/5A", category: "do-luong", price: 35000,
    marketValue: 1200000, grade: "B", seniorName: "Thu Trang (K65)", rating: 4.6, rentedCount: 21,
    sealCode: "LS-0155", appraisedDate: "28/07/2026", lastTestedDate: "10/08/2026",
    desc: "Nguồn một chiều điều chỉnh được, thiết bị được thuê nhiều nhất mùa lab.",
    specs: [
      { label: "Điện áp ra", value: "0–30V" }, { label: "Dòng ra", value: "0–5A" },
      { label: "Quạt tản nhiệt", value: "Hoạt động, hơi ồn" }, { label: "Vỏ máy", value: "Trầy xước nhẹ" },
    ],
    included: ["Dây kẹp cá sấu"], notIncluded: ["Dây nguồn AC dự phòng"],
    unavailableDays: [3, 4, 5], splitSenior: 50, splitPlatform: 50, earnedSoFar: 367500,
  },
  {
    id: "p4", name: "Kit Arduino Uno R3 + 10 cảm biến", category: "vi-dieu-khien", price: 25000,
    marketValue: 650000, grade: "A", seniorName: CURRENT_USER, rating: 4.9, rentedCount: 17,
    sealCode: "LS-0212", appraisedDate: "05/08/2026", lastTestedDate: "13/08/2026",
    desc: "Bộ kit Arduino phổ biến nhất cho môn nhập môn IoT/vi điều khiển.",
    specs: [
      { label: "Board", value: "Arduino Uno R3 chính hãng" }, { label: "Cảm biến kèm theo", value: "10 loại (nhiệt độ, siêu âm, PIR...)" },
      { label: "Cáp nạp", value: "Hoạt động tốt" }, { label: "Hộp đựng", value: "Đầy đủ, gọn gàng" },
    ],
    included: ["Cáp USB", "Breadboard", "Dây jumper"], notIncluded: ["Pin 9V"],
    unavailableDays: [8, 9], splitSenior: 60, splitPlatform: 40, earnedSoFar: 212500,
  },
  {
    id: "p5", name: "Kit STM32F103C8T6 (Blue Pill)", category: "vi-dieu-khien", price: 20000,
    marketValue: 450000, grade: "B", seniorName: CURRENT_USER, rating: 4.5, rentedCount: 6,
    sealCode: "LS-0225", appraisedDate: "07/08/2026", lastTestedDate: "13/08/2026",
    desc: "Board STM32 phổ biến cho môn Vi xử lý, kèm mạch nạp sẵn.",
    specs: [
      { label: "Vi điều khiển", value: "STM32F103C8T6" }, { label: "Mạch nạp", value: "ST-Link V2 kèm theo" },
      { label: "Chân cắm", value: "2 chân hơi lỏng" }, { label: "Bo mạch", value: "Không cong vênh" },
    ],
    included: ["Mạch nạp ST-Link", "Dây dupont"], notIncluded: [],
    unavailableDays: [14, 15, 16], splitSenior: 50, splitPlatform: 50, earnedSoFar: 60000,
  },
  {
    id: "p6", name: "Raspberry Pi 4 Model B (4GB)", category: "vi-dieu-khien", price: 40000,
    marketValue: 1800000, grade: "A", seniorName: "Thu Trang (K65)", rating: 4.8, rentedCount: 11,
     sealCode: "LS-0219", appraisedDate: "06/08/2026", lastTestedDate: "12/08/2026",
    desc: "Máy tính nhúng cho đồ án IoT/server mini, đã cài sẵn Raspbian.",
    specs: [
      { label: "RAM", value: "4GB" }, { label: "Thẻ nhớ", value: "32GB kèm hệ điều hành" },
      { label: "Nguồn", value: "Adapter 5V/3A chính hãng" }, { label: "Vỏ case", value: "Như mới" },
    ],
    included: ["Thẻ nhớ 32GB", "Adapter nguồn", "Vỏ case"], notIncluded: ["Màn hình/HDMI"],
    unavailableDays: [10, 11, 12, 25], splitSenior: 60, splitPlatform: 40, earnedSoFar: 432000,
  },
  {
    id: "p7", name: "Kit PLC Mini Siemens LOGO!", category: "plc", price: 70000,
    marketValue: 4500000, grade: "A", seniorName: "Đức Anh (K66)", rating: 4.7, rentedCount: 5,
    sealCode: "LS-0233", appraisedDate: "09/08/2026", lastTestedDate: "13/08/2026",
    desc: "Bộ PLC mini cho môn Tự động hoá và các đội thi Robocon.",
    specs: [
      { label: "Dòng PLC", value: "Siemens LOGO! 12/24RCE" }, { label: "Ngõ vào/ra", value: "8 vào / 4 ra" },
      { label: "Phần mềm", value: "LOGO! Soft Comfort kèm license test" }, { label: "Vỏ máy", value: "Như mới" },
    ],
    included: ["Cáp lập trình", "Nguồn 24V"], notIncluded: ["Cảm biến ngoại vi"],
    unavailableDays: [1, 2, 3, 18, 19], splitSenior: 60, splitPlatform: 40, earnedSoFar: 126000,
  },
  {
    id: "p8", name: "Logic Analyzer 8-channel USB", category: "do-luong", price: 30000,
    marketValue: 550000, grade: "B", seniorName: "Thu Trang (K65)", rating: 4.6, rentedCount: 8,
    sealCode: "LS-0207", appraisedDate: "04/08/2026", lastTestedDate: "11/08/2026",
    desc: "Dùng phân tích tín hiệu số cho đồ án nhúng/IoT, tương thích PulseView.",
    specs: [
      { label: "Số kênh", value: "8 kênh" }, { label: "Tốc độ lấy mẫu", value: "24MHz" },
      { label: "Phần mềm", value: "PulseView (mã nguồn mở)" }, { label: "Vỏ máy", value: "Trầy nhẹ" },
    ],
    included: ["Cáp kẹp x8", "Cáp USB"], notIncluded: [],
    unavailableDays: [6, 7], splitSenior: 50, splitPlatform: 50, earnedSoFar: 120000,
  },
];

const PROJECT_BUNDLES = [
  { id: "iot", label: "Dự án IoT", productIds: ["p4", "p6", "p8"] },
  { id: "doan", label: "Đồ án tốt nghiệp Điện tử", productIds: ["p1", "p2", "p3"] },
  { id: "onthi", label: "Ôn thi / Lab định kỳ", productIds: ["p2", "p3"] },
  { id: "robocon", label: "Thi Robocon / PLC", productIds: ["p7", "p3"] },
];

const PICKUP_POINTS = [
  { id: "ktx-b2", name: "KTX Bách Khoa – Nhà B2", hours: "07:00–21:00" },
  { id: "ktx-b9", name: "KTX Bách Khoa – Nhà B9", hours: "07:00–21:00" },
  { id: "c7", name: "Sảnh nhà C7 – Bách Khoa", hours: "08:00–18:00" },
  { id: "ta-quang-buu", name: "Ngõ 42 Tạ Quang Bửu (CTV Minh)", hours: "17:00–22:00" },
  { id: "me-tri", name: "KTX Mễ Trì – ĐHQGHN", hours: "07:00–21:00" },
];

const INSURANCE_FEE = 15000;
const DEPOSIT_RATE = 0.65;

const seedConsignments = [
  { id: "c1", name: "Kit ESP32 DevKit + màn OLED", category: "vi-dieu-khien", seniorName: "Hải Nam (K66)", estimatedValue: 350000, desc: "Bộ ESP32 kèm màn OLED 0.96 inch, đã test WiFi/Bluetooth ổn định.", dateSubmitted: "15/08/2026", status: "pending" },
  { id: "c2", name: "Multimeter Fluke 17B+", category: "do-luong", seniorName: "Đức Anh (K66)", estimatedValue: 2200000, desc: "Đồng hồ vạn năng Fluke, đo chính xác, còn bảo hành hãng.", dateSubmitted: "14/08/2026", status: "pending" },
];

const seedBookings = [
  { id: "b_seed1", renterName: "Hải Đăng (K68)", productId: "p1", start: "2026-08-18", end: "2026-08-20", nights: 2, total: 180000 + Math.round(9000000 * DEPOSIT_RATE) + INSURANCE_FEE, pickup: "ktx-b2", status: "pending", handoverStage: null },
  { id: "b_seed2", renterName: "Thu Hà (K67)", productId: "p6", start: "2026-08-10", end: "2026-08-12", nights: 2, total: 80000 + Math.round(1800000 * DEPOSIT_RATE) + INSURANCE_FEE, pickup: "c7", status: "confirmed", handoverStage: "picked_up" },
];

const savingsFor = (product, days = 5) => {
  const rentalCost = product.price * days;
  const pct = Math.round((1 - rentalCost / product.marketValue) * 100);
  return { rentalCost, pct: Math.max(pct, 0), days };
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Stars({ count, size = 12 }) {
  const full = Math.round(count);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        i < full
          ? <Star key={i} size={size} color={T.accent} />
          : <StarBorder key={i} size={size} color={T.line} />
      ))}
    </span>
  );
}

function GradeBadge({ grade }) {
  const isA = grade === "A";
  return (
    <span style={{
      background: isA ? T.tealBg : T.accentBg, color: isA ? T.tealDeep : T.accentDeep,
      fontFamily: F.display, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
    }}>
      Hạng {grade}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { bg: T.accentBg, fg: T.accentDeep, label: "Chờ xác nhận" },
    confirmed: { bg: T.tealBg, fg: T.tealDeep, label: "Đã xác nhận" },
    picked_up: { bg: T.tealBg, fg: T.tealDeep, label: "Đang sử dụng" },
    completed: { bg: "#EDEFF3", fg: T.inkSoft, label: "Hoàn tất" },
    rejected: { bg: T.dangerBg, fg: T.danger, label: "Từ chối" },
    approved: { bg: T.tealBg, fg: T.tealDeep, label: "Đang cho thuê" },
    appraisal_pending: { bg: T.purpleBg, fg: T.purple, label: "Chờ thẩm định" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.fg, fontFamily: F.display, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function MatchBadge({ badge }) {
  if (!badge) return null;
  return (
    <span style={{ position: "absolute", top: 10, left: 10, background: badge.bg, color: badge.fg, fontFamily: F.display, fontSize: 10, fontWeight: 600, padding: "4px 9px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, zIndex: 2 }}>
      <span>{badge.icon}</span>{badge.label}
    </span>
  );
}

function Card({ children, onClick, style }) {
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.line}`, cursor: onClick ? "pointer" : "default", transition: "border-color .15s", position: "relative", ...style }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.borderColor = T.ink)}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.borderColor = T.line)}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style, icon: Icon }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "13px 16px", borderRadius: 12, border: "none",
      background: disabled ? T.line : T.ink, color: disabled ? T.inkFaint : "#fff",
      fontFamily: F.display, fontWeight: 600, fontSize: 14.5,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.2, ...style,
    }}>
      {children}{Icon && <Icon size={16} />}
    </button>
  );
}

function SecondaryButton({ children, onClick, style, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 16px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.surface,
      color: T.ink, fontFamily: F.body, fontWeight: 500, fontSize: 13.5,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", ...style,
    }}>
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkFaint, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Modal({ onClose, children, width = 460 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,30,51,0.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="rm-scroll" style={{ background: T.surface, borderRadius: 18, width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto", padding: 26, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", border: `1px solid ${T.line}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={15} color={T.ink} />
        </button>
        {children}
      </div>
    </div>
  );
}

const fieldStyle = { width: "100%", padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.line}`, fontFamily: F.body, fontSize: 13, color: T.ink, background: T.bg, marginTop: 5, boxSizing: "border-box" };
const labelStyle = { fontFamily: F.body, fontSize: 11.5, color: T.inkSoft, fontWeight: 500 };

// ---------------------------------------------------------------------------
// Sidebar (3 roles)
// ---------------------------------------------------------------------------

function Sidebar({ screen, setScreen, role, setRole, pendingRentalCount, compareCount, onAdd, onExit }) {
  const itemsByRole = {
    renter: [
      { id: "home", label: "Trang chủ", icon: HomeIcon },
      { id: "myRentals", label: "Đơn của tôi", icon: Package },
      { id: "profile", label: "Cá nhân", icon: User },
    ],
    senior: [
      { id: "myConsignments", label: "Ký gửi của tôi", icon: Tag },
      { id: "profile", label: "Cá nhân", icon: User },
    ],
  };
  const items = itemsByRole[role];
  const roleLabels = { renter: "Người thuê", senior: "Senior ký gửi" };

  return (
    <aside className="rm-sidebar" style={{ background: T.surface, borderRight: `1px solid ${T.line}`, padding: "24px 16px", display: "flex", flexDirection: "column" }}>
      <div onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px 26px", cursor: onExit ? "pointer" : "default" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}></div>
        <span style={{ fontFamily: F.display, fontSize: 16.5, fontWeight: 700, color: T.ink }}>LabShare</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = screen === it.id;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10,
              border: "none", background: isActive ? T.bg : "transparent", cursor: "pointer", textAlign: "left", position: "relative",
            }}>
              <Icon size={17} color={isActive ? T.ink : T.inkFaint} strokeWidth={isActive ? 2.3 : 1.8} />
              <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? T.ink : T.inkSoft, flex: 1 }}>{it.label}</span>
              {!!it.badge && (
                <span style={{ background: T.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {role === "senior" && <SecondaryButton onClick={onAdd} icon={Plus} style={{ marginTop: 14, width: "100%" }}>Ký gửi thiết bị</SecondaryButton>}
      {role === "renter" && compareCount > 0 && (
        <div style={{ marginTop: 10, padding: "9px 10px", borderRadius: 10, background: T.accentBg, display: "flex", alignItems: "center", gap: 8 }}>
          <Scale size={14} color={T.accentDeep} />
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.accentDeep }}>{compareCount} thiết bị để so sánh</span>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.inkFaint, margin: "0 0 6px 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>Chế độ xem</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, background: T.bg, borderRadius: 10, padding: 3 }}>
          {["renter", "senior"].map((r) => {
            const isActive = role === r;
            return (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: "7px 8px", borderRadius: 8, border: "none", textAlign: "left",
                background: isActive ? T.ink : "transparent", color: isActive ? "#fff" : T.inkSoft,
                fontFamily: F.body, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
              }}>
                {roleLabels[r]}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "16px 6px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 700, fontSize: 12.5, color: T.accentDeep }}>M</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: T.ink, margin: 0, whiteSpace: "nowrap" }}>{CURRENT_USER}</p>
            <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.inkFaint, margin: 0 }}>Bách Khoa Hà Nội</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Renter — Home
// ---------------------------------------------------------------------------

const MATCH_BADGES = (() => {
  const byPrice = [...SEED_PRODUCTS].sort((a, b) => a.price - b.price)[0];
  const byRating = [...SEED_PRODUCTS].filter((p) => p.rentedCount >= 10).sort((a, b) => b.rating - a.rating)[0];
  const map = {};
  if (byRating) map[byRating.id] = {label: "Đánh giá cao nhất", bg: T.tealBg, fg: T.tealDeep };
  if (byPrice && !map[byPrice.id]) map[byPrice.id] = {label: "Giá tốt nhất", bg: T.accentBg, fg: T.accentDeep };
  return map;
})();

function ProductGridCard({ p, onClick, compareChecked, onToggleCompare }) {
  const savings = savingsFor(p);
  const badge = MATCH_BADGES[p.id];
  return (
    <Card onClick={onClick}>
      <div style={{ height: 120, borderRadius: "14px 14px 0 0", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, position: "relative" }}>
        <MatchBadge badge={badge} />
        <button onClick={(e) => { e.stopPropagation(); onToggleCompare(p.id); }} title="Thêm vào so sánh" style={{
          position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: 7, zIndex: 2,
          border: `1.5px solid ${compareChecked ? T.ink : T.line}`, background: compareChecked ? T.ink : "rgba(255,255,255,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          {compareChecked ? <Check size={13} color="#fff" /> : <Scale size={12} color={T.inkFaint} />}
        </button>
        {p.emoji}
      </div>
      <div style={{ padding: "13px 14px 14px", borderTop: `1px dashed ${T.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 13.5, color: T.ink, margin: 0 }}>{p.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <GradeBadge grade={p.grade} />
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: F.body, fontSize: 11, color: T.inkSoft }}>
            <Star size={10} color={T.accent} /> {p.rating}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: T.accentDeep }}>
            {money(p.price)}<span style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 400 }}>/ngày</span>
          </span>
          <ArrowRight size={14} color={T.inkFaint} />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.green, margin: "6px 0 0" }}> Tiết kiệm ~{savings.pct}% so với mua mới</p>
      </div>
    </Card>
  );
}

function HomeScreen({ products, onOpen, query, setQuery, catFilter, setCatFilter, maxPrice, setMaxPrice, compareIds, onToggleCompare, projectFilter, setProjectFilter }) {
  return (
    <div>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, marginBottom: 22 }}>
        <img src={heroBg} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,16,26,0.78) 0%, rgba(12,16,26,0.55) 45%, rgba(12,16,26,0.82) 100%)" }} />
        <div style={{ position: "relative", padding: "40px 32px" }}>
          <span style={{ display: "inline-block", fontFamily: F.mono, fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase", color: "#9AE6CF", background: "rgba(40,167,130,0.16)", border: "1px solid rgba(40,167,130,0.4)", padding: "4px 10px", borderRadius: 20, marginBottom: 14 }}>Ký gửi – Thẩm định – Cho thuê</span>
          <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.25, textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}>
            Cần thiết bị đo cho project?<br />Đừng mua — mượn từ khoá trên.
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 13, color: "#D8DEEB", margin: "10px 0 18px", maxWidth: 500, lineHeight: 1.6 }}>
            Thuê oscilloscope, kit Arduino/STM32, PLC... từ sinh viên khoá trên đã ký gửi qua LabShare — mọi thiết bị đều được thẩm định, phân hạng và niêm phong trước khi cho thuê.
          </p>
          <p style={{ fontFamily: F.body, fontSize: 11.5, color: "#9FB0CA", margin: "0 0 8px" }}>Bạn cần thiết bị cho việc gì?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROJECT_BUNDLES.map((b) => {
              const isActive = projectFilter === b.id;
              return (
                <button key={b.id} onClick={() => setProjectFilter(isActive ? null : b.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 20,
                  border: `1px solid ${isActive ? "#7CD6B8" : "rgba(255,255,255,0.2)"}`,
                  background: isActive ? "rgba(40,167,130,0.35)" : "rgba(255,255,255,0.1)", cursor: "pointer",
                  backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
                }}>
                  <span style={{ fontSize: 13 }}>{b.emoji}</span>
                  <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 500, color: isActive ? "#fff" : "#fff" }}>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 14px" }}>
          <Search size={16} color={T.inkFaint} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm oscilloscope, Arduino, PLC..."
            style={{ border: "none", outline: "none", flex: 1, fontFamily: F.body, fontSize: 13.5, background: "transparent", color: T.ink }} />
        </div>
        <div style={{ flex: "0 0 220px", display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "0 14px" }}>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, whiteSpace: "nowrap" }}>≤ {money(maxPrice)}</span>
          <input type="range" min={15000} max={100000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ flex: 1 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {CATS.map((c) => {
          const isActive = catFilter === c.id;
          return (
            <button key={c.id} onClick={() => setCatFilter(isActive ? null : c.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 20,
              border: `1px solid ${isActive ? T.ink : T.line}`, background: isActive ? T.ink : T.surface, cursor: "pointer",
            }}>
              <span style={{ fontSize: 13 }}>{c.emoji}</span>
              <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 500, color: isActive ? "#fff" : T.inkSoft }}>{c.label}</span>
            </button>
          );
        })}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "0 0 12px" }}>{products.length} thiết bị phù hợp</p>

      {products.length === 0 ? (
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkFaint, textAlign: "center", marginTop: 40 }}>Không tìm thấy thiết bị phù hợp. Thử đổi bộ lọc.</p>
      ) : (
        <div className="rm-grid">
          {products.map((p) => <ProductGridCard key={p.id} p={p} onClick={() => onOpen(p)} compareChecked={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

function CompareBar({ ids, onOpen, onClear }) {
  if (ids.length < 2) return null;
  return (
    <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 30, background: T.ink, borderRadius: 14, padding: "10px 10px 10px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 24px rgba(22,30,51,0.25)" }}>
      <span style={{ fontFamily: F.body, fontSize: 13, color: "#fff" }}>{ids.length} thiết bị đã chọn</span>
      <button onClick={onClear} style={{ background: "none", border: "none", color: "#B9C0D1", fontFamily: F.body, fontSize: 12, cursor: "pointer" }}>Xoá</button>
      <PrimaryButton onClick={onOpen} icon={Scale} style={{ width: "auto", padding: "9px 16px", background: T.accent, color: T.accentDeep }}>So sánh ngay</PrimaryButton>
    </div>
  );
}

function CompareModal({ products, onClose, onOpenDetail }) {
  const rows = [
    { label: "Giá / ngày", get: (p) => money(p.price) },
    { label: "Phân hạng", get: (p) => `Hạng ${p.grade}` },
    { label: "Đánh giá thiết bị", get: (p) => `${p.rating} (${p.rentedCount} lượt thuê)` },
    { label: "Giá trị thị trường", get: (p) => moneyShort(p.marketValue) },
    { label: "Tiền cọc (65%)", get: (p) => money(Math.round(p.marketValue * DEPOSIT_RATE)) },
    { label: "Tiết kiệm vs mua (5 ngày)", get: (p) => `~${savingsFor(p).pct}%` },
  ];
  return (
    <Modal onClose={onClose} width={720}>
      <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>So sánh thiết bị</h2>
      <div className="rm-compare-grid" style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}>
        <div />
        {products.map((p) => (
          <div key={p.id} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{p.emoji}</div>
            <p style={{ fontFamily: F.display, fontSize: 12, fontWeight: 600, color: T.ink, margin: "6px 0 0" }}>{p.name}</p>
          </div>
        ))}
        {rows.map((row) => (
          <React.Fragment key={row.label}>
            <div style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, alignSelf: "center", paddingTop: 10, borderTop: `1px solid ${T.line}` }}>{row.label}</div>
            {products.map((p) => <div key={p.id} style={{ fontFamily: F.mono, fontSize: 12.5, color: T.ink, textAlign: "center", paddingTop: 10, borderTop: `1px solid ${T.line}` }}>{row.get(p)}</div>)}
          </React.Fragment>
        ))}
        <div />
        {products.map((p) => (
          <div key={p.id} style={{ paddingTop: 14 }}>
            <SecondaryButton onClick={() => onOpenDetail(p)} style={{ width: "100%" }}>Xem chi tiết</SecondaryButton>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Availability calendar
// ---------------------------------------------------------------------------

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function AvailabilityCalendar({ product, start, end, onPick }) {
  const year = 2026, month = 7;
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const dateStr = (d) => `2026-08-${String(d).padStart(2, "0")}`;
  const startDay = start ? Number(start.split("-")[2]) : null;
  const endDay = end ? Number(end.split("-")[2]) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: F.display, fontSize: 12.5, fontWeight: 600, color: T.ink }}>Tháng 8, 2026</span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: T.tealBg, border: `1px solid ${T.teal}` }} /> Trống
          </span>
          <span style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: T.dangerBg }} /> Đã thuê
          </span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {WEEKDAYS.map((w) => <span key={w} style={{ fontFamily: F.body, fontSize: 9.5, color: T.inkFaint, textAlign: "center" }}>{w}</span>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const unavailable = product.unavailableDays.includes(d);
          const inRange = startDay && endDay && d >= startDay && d <= endDay;
          const isEdge = d === startDay || d === endDay;
          return (
            <button key={i} disabled={unavailable} onClick={() => onPick(dateStr(d))} style={{
              aspectRatio: "1", borderRadius: 7, border: "none", cursor: unavailable ? "not-allowed" : "pointer",
              background: unavailable ? T.dangerBg : isEdge ? T.ink : inRange ? T.tealBg : T.bg,
              color: unavailable ? T.danger : isEdge ? "#fff" : T.ink,
              fontFamily: F.mono, fontSize: 10.5, fontWeight: isEdge ? 700 : 400,
            }}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail + booking
// ---------------------------------------------------------------------------

function VerificationPanel({ product }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <ShieldCheck size={16} color={T.teal} />
        <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: 0 }}>Đã thẩm định bởi LabShare</p>
        <GradeBadge grade={product.grade} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          ["Mã niêm phong", product.sealCode],
          ["Ngày thẩm định", product.appraisedDate],
          ["Kiểm tra gần nhất", product.lastTestedDate],
          ["Số lượt đã thuê", `${product.rentedCount} lượt`],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 12 }}>
            <span style={{ color: T.inkFaint }}>{label}</span>
            <span style={{ color: T.ink, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.green, background: T.greenBg, padding: "4px 9px", borderRadius: 20 }}>
          <Check size={11} /> 0 sự cố báo cáo
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, background: T.bg, padding: "4px 9px", borderRadius: 20 }}>
          Ký gửi bởi {product.seniorName}
        </span>
      </div>
    </div>
  );
}

function SpecCard({ product }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: "0 0 10px" }}>Thông số & tình trạng</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {product.specs.map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 12 }}>
            <span style={{ color: T.inkFaint }}>{d.label}</span>
            <span style={{ color: T.ink, fontWeight: 500 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncludedCard({ product }) {
  if (!product.included.length && !product.notIncluded.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: "0 0 10px" }}>Bao gồm những gì?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {product.included.map((it, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.green, background: T.greenBg, padding: "5px 10px", borderRadius: 20 }}><Check size={11} /> {it}</span>
        ))}
        {product.notIncluded.map((it, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, background: T.bg, padding: "5px 10px", borderRadius: 20 }}><X size={11} /> {it}</span>
        ))}
      </div>
    </div>
  );
}

function BookingPanel({ product, onConfirm }) {
  const [start, setStart] = useState("2026-08-15");
  const [end, setEnd] = useState("2026-08-18");
  const [pickupId, setPickupId] = useState(PICKUP_POINTS[0].id);
  const [contactName, setContactName] = useState(CURRENT_USER);
  const [contactPhone, setContactPhone] = useState(CURRENT_USER_PHONE);

  const pick = (dateStr) => {
    const d = Number(dateStr.split("-")[2]);
    const s = start ? Number(start.split("-")[2]) : null;
    if (!s || (start && end)) { setStart(dateStr); setEnd(""); }
    else if (d > s) setEnd(dateStr);
    else setStart(dateStr);
  };

  const nights = useMemo(() => {
    if (!start || !end) return 0;
    const d = (new Date(end) - new Date(start)) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  }, [start, end]);

  const rentalCost = Math.max(nights, 0) * product.price;
  const deposit = Math.round(product.marketValue * DEPOSIT_RATE);
  const total = rentalCost + deposit + INSURANCE_FEE;
  const valid = nights > 0 && contactName.trim().length > 0 && contactPhone.trim().length > 0;
  const savings = savingsFor(product, Math.max(nights, 5));

  return (
    <div style={{ position: "sticky", top: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 4 }}>
        <span style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: T.ink }}>{money(product.price)}</span>
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>/ ngày</span>
      </div>
      <p style={{ fontFamily: F.body, fontSize: 11, color: T.green, margin: "0 0 14px" }}>Giá trị thị trường {moneyShort(product.marketValue)} — thuê tiết kiệm ~{savings.pct}%</p>

      <AvailabilityCalendar product={product} start={start} end={end} onPick={pick} />

      <p style={{ fontFamily: F.mono, fontSize: 12, color: T.inkSoft, margin: "10px 0 0" }}>
        {start ? start.slice(5).split("-").reverse().join("/") : "—"} → {end ? end.slice(5).split("-").reverse().join("/") : "—"}
        {valid && <span style={{ color: T.inkFaint }}> ({nights} đêm)</span>}
      </p>
      {!valid && <p style={{ fontFamily: F.body, fontSize: 11, color: T.danger, marginTop: 4 }}>Chọn ngày nhận rồi chọn ngày trả trên lịch.</p>}

      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Điểm nhận / trả đồ</label>
      <select value={pickupId} onChange={(e) => setPickupId(e.target.value)} style={fieldStyle}>
        {PICKUP_POINTS.map((pt) => <option key={pt.id} value={pt.id}>{pt.name} · {pt.hours}</option>)}
      </select>

      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Họ tên</label>
      <input style={fieldStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Số điện thoại</label>
      <input style={fieldStyle} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} inputMode="tel" placeholder="VD: 0912 345 678" />

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14, padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg }}>
        <Wallet size={14} color={T.teal} />
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.ink }}>Thanh toán demo (mock)</span>
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${T.line}` }}>
        {[
          [`${Math.max(nights, 0)} đêm × ${money(product.price)}`, money(Math.max(rentalCost, 0))],
          ["Tiền cọc (65% giá trị thiết bị, hoàn lại)", money(deposit)],
          ["Phí quỹ bảo hiểm rủi ro", money(INSURANCE_FEE)],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft }}>{label}</span>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: T.ink }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 10, borderTop: `1px dashed ${T.line}` }}>
          <span style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 600, color: T.ink }}>Tổng cộng</span>
          <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: T.accentDeep }}>{money(Math.max(total, 0))}</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint, marginTop: 8 }}>Tiền cọc được hoàn lại sau khi LabShare đối soát tình trạng khi trả đồ.</p>
      </div>

      <PrimaryButton style={{ marginTop: 16 }} disabled={!valid} onClick={() => onConfirm({ product, start, end, nights, total, pickupId, contactName: contactName.trim(), contactPhone: contactPhone.trim() })} icon={ArrowRight}>
        Xác nhận thuê
      </PrimaryButton>
    </div>
  );
}

function DetailScreen({ product, onConfirm }) {
  if (!product) return null;
  const badge = MATCH_BADGES[product.id];
  return (
    <div className="rm-detail">
      <div>
        <div style={{ height: 200, borderRadius: 18, background: T.surface, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, marginBottom: 18, position: "relative" }}>
          <MatchBadge badge={badge} />
          {product.emoji}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: F.body, fontSize: 10.5, fontWeight: 600, color: T.inkSoft, background: T.surface, border: `1px solid ${T.line}`, padding: "3px 9px", borderRadius: 20 }}>{catInfo(product.category).label}</span>
          <GradeBadge grade={product.grade} />
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 23, fontWeight: 700, color: T.ink, margin: "10px 0 6px" }}>{product.name}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars count={product.rating} size={13} />
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>{product.rating} ({product.rentedCount} lượt thuê)</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, margin: "16px 0 0" }}>{product.desc}</p>

        <SpecCard product={product} />
        <IncludedCard product={product} />
        <VerificationPanel product={product} />
      </div>

      <BookingPanel product={product} onConfirm={onConfirm} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation / QR / return checklist
// ---------------------------------------------------------------------------

function ConfirmedModal({ booking, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 4px" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={27} color={T.teal} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>Đã gửi yêu cầu thuê</h2>
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, lineHeight: 1.6, margin: "0 0 20px" }}>
          LabShare sẽ xác nhận đơn "{booking.product.name}" và chuẩn bị thiết bị tại điểm hẹn bạn chọn.
        </p>
        <PrimaryButton onClick={onClose} icon={Package}>Xem đơn thuê của tôi</PrimaryButton>
      </div>
    </Modal>
  );
}

function QRPattern() {
  const cells = useMemo(() => Array.from({ length: 121 }, () => Math.random() > 0.55), []);
  return (
    <div style={{ width: 160, height: 160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 2, padding: 10, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10 }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? T.ink : "transparent" }} />)}
    </div>
  );
}

function QRModal({ booking, onClose, onConfirm }) {
  const pt = PICKUP_POINTS.find((p) => p.id === booking.pickupId);
  return (
    <Modal onClose={onClose} width={360}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>Xác nhận nhận đồ</p>
        <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "0 0 16px" }}>Đơn #{booking.id.slice(-5).toUpperCase()} · {booking.product.name}</p>
        <QRPattern />
        <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "14px 0 6px" }}>CTV tại {pt ? pt.name : "điểm hẹn"} quét mã này để xác nhận bàn giao.</p>
        <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "0 0 18px" }}>LabShare đã quay video test nhanh thiết bị trước khi bàn giao ✓</p>
        <PrimaryButton onClick={onConfirm} icon={Check}>Đã quét — xác nhận nhận đồ</PrimaryButton>
      </div>
    </Modal>
  );
}

function ReturnChecklistModal({ booking, onClose, onConfirm }) {
  const [checks, setChecks] = useState({ item: false, accessory: false, damage: false });
  const allChecked = Object.values(checks).every(Boolean);
  const toggle = (k) => setChecks((c) => ({ ...c, [k]: !c[k] }));
  const deposit = Math.round(booking.product.marketValue * DEPOSIT_RATE);
  const rows = [
    { k: "item", label: `${booking.product.name} còn nguyên vẹn` },
    { k: "accessory", label: "Phụ kiện đi kèm đầy đủ" },
    { k: "damage", label: "Không có hư hỏng phát sinh" },
  ];
  return (
    <Modal onClose={onClose} width={380}>
      <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 14px" }}>Xác nhận trả đồ</p>
      {rows.map((r) => (
        <label key={r.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", cursor: "pointer" }}>
          <input type="checkbox" checked={checks[r.k]} onChange={() => toggle(r.k)} style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink }}>{r.label}</span>
        </label>
      ))}
      <div style={{ marginTop: 10, padding: "10px 12px", background: T.tealBg, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.tealDeep }}>Tiền cọc sẽ hoàn</span>
        <span style={{ fontFamily: F.mono, fontSize: 12.5, fontWeight: 600, color: T.tealDeep }}>{money(deposit)}</span>
      </div>
      <PrimaryButton style={{ marginTop: 14 }} disabled={!allChecked} onClick={onConfirm} icon={Check}>Xác nhận trả đồ & hoàn cọc</PrimaryButton>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Rental timeline + My Rentals (renter)
// ---------------------------------------------------------------------------

const TIMELINE_STEPS = ["Đặt thuê", "LabShare xác nhận", "Nhận đồ", "Đang sử dụng", "Trả đồ", "Hoàn tất & hoàn cọc"];

function stepIndex(booking) {
  if (booking.status === "pending") return 1;
  if (booking.status === "completed") return 5;
  if (booking.handoverStage === "picked_up") return 3;
  return 2;
}

function RentalTimeline({ booking }) {
  const current = stepIndex(booking);
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
      {TIMELINE_STEPS.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: i === 0 || i === TIMELINE_STEPS.length - 1 ? "0 0 auto" : 1 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: done ? T.teal : active ? T.accent : T.line }} />
              <span style={{ fontFamily: F.body, fontSize: 9, color: done || active ? T.inkSoft : T.inkFaint, marginTop: 4, textAlign: "center", maxWidth: 56 }}>{label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, background: i < current ? T.teal : T.line, marginBottom: 14 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function MyRentalsScreen({ bookings, catalog, onOpenQR, onOpenReturn }) {
  const mine = bookings.filter((b) => b.renterName === CURRENT_USER_RENTER_LABEL);
  return (
    <div>
      <PageHeader title="Đơn thuê của tôi" subtitle="Theo dõi trạng thái các thiết bị bạn đã thuê." />
      {mine.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}></p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Chưa có đơn thuê nào</p>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, marginTop: 6 }}>Tìm thiết bị ở trang chủ để bắt đầu thuê.</p>
        </div>
      ) : (
        <div className="rm-grid">
          {mine.map((b) => {
            const product = catalog.find((p) => p.id === b.productId) || b.product;
            const pt = PICKUP_POINTS.find((p) => p.id === b.pickupId);
            return (
              <Card key={b.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28 }}>{product.emoji}</div>
                  <StatusBadge status={b.status === "confirmed" && b.handoverStage === "picked_up" ? "picked_up" : b.status} />
                </div>
                <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: "10px 0 0" }}>{product.name}</p>
                <p style={{ fontFamily: F.mono, fontSize: 11.5, color: T.inkFaint, margin: "4px 0 0" }}>{b.start} → {b.end}</p>
                {pt && <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "2px 0 0" }}>\uD83D\uDCCD {pt.name}</p>}
                {b.contactPhone && <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkSoft, margin: "2px 0 0" }}>{b.contactName || CURRENT_USER} \u00B7 {b.contactPhone}</p>}

                {b.status !== "rejected" && <RentalTimeline booking={b} />}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
                  <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint }}>Tổng</span>
                  <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: T.ink }}>{money(b.total)}</span>
                </div>

                {b.status === "confirmed" && !b.handoverStage && <SecondaryButton onClick={() => onOpenQR(b)} style={{ width: "100%", marginTop: 10 }}>Xác nhận nhận đồ (quét QR)</SecondaryButton>}
                {b.status === "confirmed" && b.handoverStage === "picked_up" && <SecondaryButton onClick={() => onOpenReturn(b)} style={{ width: "100%", marginTop: 10 }}>Trả đồ</SecondaryButton>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ---------------------------------------------------------------------------
// Senior — my consignments
// ---------------------------------------------------------------------------

function MyConsignmentsScreen({ consignments, catalog, onAdd }) {
  const mine = consignments.filter((c) => c.seniorName === CURRENT_USER);
  const totalEarned = catalog.filter((p) => p.seniorName === CURRENT_USER).reduce((s, p) => s + p.earnedSoFar, 0);

  return (
    <div>
      <PageHeader
        title="Ký gửi của tôi" subtitle="Thiết bị bạn đã ký gửi cho LabShare cho thuê lại."
        right={<PrimaryButton onClick={onAdd} icon={Plus} style={{ width: "auto", padding: "11px 18px" }}>Ký gửi thiết bị</PrimaryButton>}
      />

      <Card style={{ padding: 16, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: 0 }}>Tổng thu nhập đã đối soát</p>
          <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.green, margin: "2px 0 0" }}>{money(totalEarned)}</p>
        </div>
        <Wallet size={22} color={T.green} />
      </Card>

      {mine.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}></p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Chưa ký gửi thiết bị nào</p>
        </div>
      ) : (
        <div className="rm-grid">
          {mine.map((c) => {
            const live = catalog.find((p) => p.id === c.productId);
            return (
              <Card key={c.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 26 }}>{catInfo(c.category).emoji}</div>
                  <StatusBadge status={c.status === "approved" ? "approved" : c.status === "rejected" ? "rejected" : "appraisal_pending"} />
                </div>
                <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: "10px 0 0" }}>{c.name}</p>
                {c.contactPhone && <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkSoft, margin: "3px 0 0" }}>{c.contactName || CURRENT_USER} · {c.contactPhone}</p>}
                {live ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <GradeBadge grade={live.grade} />
                      <span style={{ fontFamily: F.mono, fontSize: 12, color: T.accentDeep }}>{money(live.price)}/ngày</span>
                    </div>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "8px 0 0" }}>Bạn nhận {live.splitSenior}% doanh thu · {live.rentedCount} lượt thuê</p>
                    <p style={{ fontFamily: F.mono, fontSize: 12.5, color: T.green, margin: "4px 0 0" }}>Đã kiếm: {money(live.earnedSoFar)}</p>
                  </>
                ) : (
                  <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "8px 0 0" }}>Giá trị khai báo: {money(c.estimatedValue)}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddConsignmentModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", category: "vi-dieu-khien", estimatedValue: "", desc: "", contactName: CURRENT_USER, contactPhone: CURRENT_USER_PHONE });
  const [error, setError] = useState("");
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.contactName.trim() || !form.contactPhone.trim()) { setError("Nhập họ tên và số điện thoại để LabShare liên hệ hẹn thẩm định."); return; }
    if (!form.name.trim() || !form.estimatedValue || Number(form.estimatedValue) <= 0) { setError("Nhập tên thiết bị và giá trị ước tính hợp lệ."); return; }
    setError("");
    onSubmit({
      id: "c" + Date.now(), name: form.name.trim(), category: form.category, seniorName: form.contactName.trim(),
      contactName: form.contactName.trim(), contactPhone: form.contactPhone.trim(),
      estimatedValue: Number(form.estimatedValue), desc: form.desc.trim() || "Chưa có mô tả chi tiết.",
      dateSubmitted: "Hôm nay", status: "pending",
    });
  };

  return (
    <Modal onClose={onClose} width={460}>
      <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>Ký gửi thiết bị</h2>
      <label style={labelStyle}>Họ tên</label>
      <input style={fieldStyle} value={form.contactName} onChange={update("contactName")} placeholder="VD: Nguyễn Văn A" />
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Số điện thoại</label>
      <input style={fieldStyle} value={form.contactPhone} onChange={update("contactPhone")} inputMode="tel" placeholder="VD: 0912 345 678" />
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Tên thiết bị</label>
      <input style={fieldStyle} value={form.name} onChange={update("name")} placeholder="VD: Kit ESP32 DevKit" />
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Danh mục</label>
      <select style={fieldStyle} value={form.category} onChange={update("category")}>
        {CATS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Giá trị thị trường ước tính (đ)</label>
      <input type="number" style={fieldStyle} value={form.estimatedValue} onChange={update("estimatedValue")} placeholder="500000" />
      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Mô tả tình trạng</label>
      <textarea style={{ ...fieldStyle, minHeight: 68, resize: "vertical" }} value={form.desc} onChange={update("desc")} placeholder="Tình trạng hoạt động, phụ kiện đi kèm..." />
      <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, marginTop: 10 }}>LabShare sẽ hẹn thẩm định trực tiếp, phân hạng A/B, dán tem niêm phong và báo giá thuê trước khi đăng bán.</p>
      {error && <p style={{ fontFamily: F.body, fontSize: 12, color: T.danger, marginTop: 8 }}>{error}</p>}
      <PrimaryButton style={{ marginTop: 16 }} onClick={submit} icon={Check}>Gửi yêu cầu ký gửi</PrimaryButton>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

function ProfileScreen({ role, setRole, onLogout }) {
  const roleLabels = { renter: "Người thuê", senior: "Senior ký gửi" };
  const initial = (CURRENT_USER || "?").charAt(0).toUpperCase();
  return (
    <div>
      <PageHeader title="Cá nhân" />
      <Card style={{ padding: 20, maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.accentDeep }}>{initial}</div>
          <div>
            <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>{CURRENT_USER}</p>
            <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "2px 0 0" }}>Sinh viên · Bách Khoa Hà Nội</p>
          </div>
        </div>
        <p style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 600, color: T.ink, margin: "18px 0 8px" }}>Đang xem với vai trò: {roleLabels[role]}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["renter", "senior"].map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${role === r ? T.ink : T.line}`,
              background: role === r ? T.ink : T.bg, color: role === r ? "#fff" : T.inkSoft,
              fontFamily: F.body, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            }}>{roleLabels[r]}</button>
          ))}
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{
            marginTop: 20, width: "100%", padding: "10px 0", borderRadius: 10,
            border: `1.5px solid ${T.line}`, background: T.surface, color: T.inkSoft,
            fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Đăng xuất</button>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth — login / register (uses /auth endpoints)
// ---------------------------------------------------------------------------

// Quick demo accounts (seeded in the backend).
const DEMO_ACCOUNTS = [
  { label: "Người thuê", name: "Thu Trang", email: "thutrang@bk.edu.vn", emoji: "🧑‍🎓" },
  { label: "Senior", name: "Đức Anh", email: "ducanh@bk.edu.vn", emoji: "🎓" },
];
const DEMO_PASSWORD = "password123";

function AuthScreen({ onLogin, onBack }) {
  const [mode, setMode] = useState("login"); // login | register
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", studentId: "", email: "", password: "", phone: "" });
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const doAuth = (payload) => {
    setBusy(true); setError("");
    fetch("/auth/" + mode, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return setError(j.error || "Đăng nhập thất bại");
        onLogin(j.token, j.user);
      })
      .catch(() => setError("Không kết nối được server. Kiểm tra backend đã chạy."))
      .finally(() => setBusy(false));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Nhập email và mật khẩu.");
    if (mode === "register" && !form.name) return setError("Nhập tên của bạn.");
    doAuth({
      name: form.name, studentId: form.studentId || undefined,
      email: form.email.trim(), password: form.password,
      phone: form.phone.trim(),
    });
  };

  const quickLogin = (email) => doAuth({ email, password: DEMO_PASSWORD });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card style={{ width: "100%", maxWidth: 400, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 26 }}>🏷️</div>
          <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 19, color: T.ink }}>LabShare</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, margin: "2px 0 18px" }}>{mode === "login" ? "Đăng nhập để tiếp tục" : "Tạo tài khoản mới"}</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${mode === m ? T.ink : T.line}`,
              background: mode === m ? T.ink : T.surface, color: mode === m ? "#fff" : T.inkSoft,
              fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{m === "login" ? "Đăng nhập" : "Đăng ký"}</button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label style={labelStyle}>Tên</label>
              <input style={fieldStyle} value={form.name} onChange={update("name")} placeholder="VD: Nguyễn Văn A" />
              <label style={{ ...labelStyle, display: "block", marginTop: 12 }}>Mã SV (tuỳ chọn)</label>
              <input style={fieldStyle} value={form.studentId} onChange={update("studentId")} placeholder="2022A123" />
              <label style={{ ...labelStyle, display: "block", marginTop: 12 }}>Số điện thoại</label>
              <input style={fieldStyle} value={form.phone} onChange={update("phone")} inputMode="tel" placeholder="VD: 0912 345 678" />
            </>
          )}
          <label style={labelStyle}>Email</label>
          <input style={fieldStyle} type="email" value={form.email} onChange={update("email")} placeholder="ban@bk.edu.vn" />
          <label style={{ ...labelStyle, display: "block", marginTop: 12 }}>Mật khẩu</label>
          <input style={fieldStyle} type="password" value={form.password} onChange={update("password")} placeholder="••••••••" />
          {error && <p style={{ fontFamily: F.body, fontSize: 12, color: T.danger, marginTop: 10 }}>{error}</p>}
          <PrimaryButton style={{ marginTop: 16, width: "100%" }} disabled={busy}>
            {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </PrimaryButton>
        </form>

        {mode === "login" && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${T.line}` }}>
            <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "0 0 8px" }}>Đăng nhập nhanh (demo):</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} onClick={() => quickLogin(a.email)} disabled={busy} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
                  borderRadius: 9, border: `1px solid ${T.line}`, background: T.surface,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ fontSize: 16 }}>{a.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: T.ink }}>{a.name} — {a.label}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.inkFaint }}>{a.email}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 12, color: T.inkFaint, padding: 0 }}>← Về trang chủ</button>
          <a href="/admin.html" style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, textDecoration: "none", borderBottom: `1px dotted ${T.line}`, paddingBottom: 1 }}>Đăng nhập quản trị →</a>
        </div>
      </Card>
    </div>
  );
}

const ROLE_DEFAULT_SCREEN = { renter: "home", senior: "myConsignments" };

export default function App({ onExit }) {
  const [screen, setScreen] = useState("home");
  // A personal account is both renter + senior (switching is just a view
  // toggle). Admins use their own separate frontend at /admin.html and are
  // redirected away below.
  const [role, setRole] = useState("renter");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState(null);
  const [projectFilter, setProjectFilter] = useState(null);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [addConsignModalOpen, setAddConsignModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [qrBooking, setQrBooking] = useState(null);
  const [returnBooking, setReturnBooking] = useState(null);

  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [catalog, setCatalog] = useState(SEED_PRODUCTS);
  const [consignments, setConsignments] = useState(seedConsignments);
  const [bookings, setBookings] = useState(seedBookings);

  // Login gate: a valid, backend-verified session keeps you signed in. An
  // orphaned/expired localStorage token is NOT trusted — we confirm it with
  // GET /auth/me before unlocking the app, else we land on the auth screen.
  const [authStatus, setAuthStatus] = useState(() =>
    SESSION_TOKEN ? "loading" : "out"
  );

  // catalog load — refetches /api/products (running off the SEED fallback so a
  // refreshed app shows fresh data). The cart merge keeps local fields SEED
  // marks rich (id p1..p8, unavailableDays day-numbers); DB wins for
  // price/marketValue/rating/rentedCount/earnedSoFar/desc/specs/included/
  // notIncluded. Extracted so we can re-run it (polling) instead of fetching
  // once at mount — that's how a consignment approved in the admin FE shows up
  // here without a manual refresh.
  const loadCatalog = useCallback(async () => {
    try {
      const r = await fetch("/api/products");
      if (!r.ok) throw new Error("catalog fetch failed");
      const { products } = await r.json();
      if (!Array.isArray(products)) return;
      const bySeal = (apiProd) => {
        const seed = SEED_PRODUCTS.find((s) => s.sealCode === apiProd.sealCode);
        return {
          ...apiProd,
          id: seed ? seed.id : apiProd.sealCode,
          unavailableDays: seed ? seed.unavailableDays : (apiProd.unavailableDays || []),
          splitSenior: apiProd.splitSenior, splitPlatform: apiProd.splitPlatform,
        };
      };
      setCatalog(products.map(bySeal));
    } catch { /* keep SEED fallback if API is down */ }
  }, []);

  // Initial hydrate on mount.
  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  // Light polling while browsing the catalog/home so newly-appraised products
  // appear without a manual refresh. Stops as soon as you leave home.
  useEffect(() => {
    if (screen !== "home") return;
    const id = setInterval(loadCatalog, 20000);
    return () => clearInterval(id);
  }, [screen, loadCatalog]);

  // Bootstrap the session: if a token exists, verify it against the backend
  // before letting the user in. Invalid/expired tokens are cleared so the
  // auth screen always appears instead of silently using the default persona.
  useEffect(() => {
    if (!SESSION_TOKEN) return;
    let active = true;
    fetch("/auth/me", { headers: { Authorization: "Bearer " + SESSION_TOKEN } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad token"))))
      .then(({ user }) => {
        if (!active) return;
        // Admin accounts don't belong in the user app — send them to the
        // separate admin frontend.
        if (user.isAdmin) { setSession(null, null); window.location.href = "/admin.html"; return; }
        setSession(SESSION_TOKEN, user);
        setRole("renter");
        setAuthStatus("in");
      })
      .catch(() => {
        if (!active) return;
        setSession(null, null); // drop the stale token
        setAuthStatus("out");
      });
    return () => { active = false; };
  }, []);

  const changeRole = (r) => { setRole(r); setScreen(ROLE_DEFAULT_SCREEN[r]); };

  const filteredProducts = useMemo(() => {
    const bundle = projectFilter ? PROJECT_BUNDLES.find((b) => b.id === projectFilter) : null;
    return catalog.filter((p) => {
      if (bundle && !bundle.productIds.includes(p.id)) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [catalog, query, catFilter, maxPrice, projectFilter]);

  const pendingRentalCount = bookings.filter((b) => b.status === "pending").length;
  const pendingAppraisalCount = consignments.filter((c) => c.status === "pending").length;

  const openProduct = (p) => { setSelectedProduct(p); setScreen("detail"); setCompareOpen(false); };

  const confirmBooking = (b) => {
    const id = "b" + Date.now();
    setBookings((list) => [{ id, productId: b.product.id, start: b.start, end: b.end, nights: b.nights, total: b.total, pickupId: b.pickupId, renterName: b.contactName || CURRENT_USER_RENTER_LABEL, contactName: b.contactName, contactPhone: b.contactPhone, status: "pending", handoverStage: null }, ...list]);
    setConfirmedBooking({ ...b, id });
    // Sync to backend (renter action). On success adopt the server booking id;
    // on failure keep the optimistic local entry (prototype fallback).
    api("/bookings", {}, {
      productId: b.product.sealCode || b.product.id, pickupId: b.pickupId,
      startDate: b.start, endDate: b.end,
      contactName: b.contactName, contactPhone: b.contactPhone,
    }).then(({ booking }) => {
      setBookings((list) => list.map((x) => (x.id === id ? { ...x, id: booking.id, start: booking.start, end: booking.end, nights: booking.nights, total: booking.total, pickupId: booking.pickupId } : x)));
    }).catch(() => { /* keep local */ });
  };

  const updateBooking = (id, patch) => {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    // Map local mutations to backend transitions.
    if (patch.handoverStage === "picked_up") {
      apiAdmin(`/admin/bookings/${id}/handover`).catch(() => { /* keep local */ });
    }
    if (patch.status === "completed") {
      const booking = bookings.find((b) => b.id === id);
      if (booking) {
        setCatalog((list) => list.map((p) => {
          if (p.id !== booking.productId) return p;
          const earned = Math.round((booking.nights * p.price) * (p.splitSenior / 100));
          return { ...p, earnedSoFar: p.earnedSoFar + earned, rentedCount: p.rentedCount + 1 };
        }));
      }
      // Return triggers the backend ledger finalization (deposit release etc.).
      apiAdmin(`/admin/bookings/${id}/return`).catch(() => { /* keep local */ });
    }
  };

  const toggleCompare = (id) => setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 3 ? ids : [...ids, id]));

  const addConsignment = (item) => {
    const local = { ...item, id: "c" + Date.now(), dateSubmitted: "Hôm nay", status: "pending" };
    setConsignments((list) => [local, ...list]);
    setAddConsignModalOpen(false); setScreen("myConsignments");
    // Sync to backend; if it fails we keep the local entry (prototype fallback).
    api("/consignments", {}, {
      name: local.name, category: local.category, estimatedValue: local.estimatedValue, desc: local.desc,
      contactName: local.contactName, contactPhone: local.contactPhone,
    }).then(({ consignment }) => {
      // Replace the optimistic id with the DB id (and show DB status).
      setConsignments((list) => list.map((c) => (c.id === local.id ? { ...c, id: consignment.id, dateSubmitted: consignment.dateSubmitted } : c)));
    }).catch(() => { /* keep local */ });
  };

  const compareProducts = catalog.filter((p) => compareIds.includes(p.id));

  let body;
  if (screen === "home") {
    body = <HomeScreen products={filteredProducts} onOpen={openProduct} query={query} setQuery={setQuery} catFilter={catFilter} setCatFilter={setCatFilter} maxPrice={maxPrice} setMaxPrice={setMaxPrice} compareIds={compareIds} onToggleCompare={toggleCompare} projectFilter={projectFilter} setProjectFilter={setProjectFilter} />;
  } else if (screen === "detail") {
    body = <DetailScreen product={selectedProduct} onConfirm={confirmBooking} />;
  } else if (screen === "myRentals") {
    body = <MyRentalsScreen bookings={bookings} catalog={catalog} onOpenQR={setQrBooking} onOpenReturn={setReturnBooking} />;
  } else if (screen === "myConsignments") {
    body = <MyConsignmentsScreen consignments={consignments} catalog={catalog} onAdd={() => setAddConsignModalOpen(true)} />;
  } else if (screen === "profile") {
    body = <ProfileScreen role={role} setRole={changeRole} onLogout={() => { setSession(null, null); setAuthStatus("out"); }} />;
  }

  // Session gate — placed AFTER every hook so the hook order/count stays
  // stable across renders (early-returning before them crashes React with
  // "Rendered more hooks than during the previous render").
  if (authStatus === "loading") {
    return <div style={{ minHeight: "100vh", background: "var(--bg,#eef1f6)" }} />;
  }
  if (authStatus === "out") {
    return (
      <AuthScreen
        onLogin={(token, user) => {
          setSession(token, user);
          // Admin accounts don't belong in the user app — hand them to the
          // admin FE right after login (same shared login UI, role-based render).
          if (user && user.isAdmin) { window.location.href = "/admin.html"; return; }
          setAuthStatus("in");
        }}
        onBack={onExit}
      />
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: F.body }}>
      <style>{GLOBAL_CSS}</style>
      <div className="rm-shell">
        <Sidebar screen={screen} setScreen={setScreen} role={role} setRole={changeRole} pendingRentalCount={pendingRentalCount} compareCount={compareIds.length} onAdd={() => setAddConsignModalOpen(true)} onExit={onExit} />
        <main className="rm-main" style={{ padding: "28px 32px 90px", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
          {screen === "detail" && (
            <button onClick={() => setScreen("home")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>← Quay lại danh sách</button>
          )}
          {body}
        </main>
      </div>

      {screen === "home" && <CompareBar ids={compareIds} onOpen={() => setCompareOpen(true)} onClear={() => setCompareIds([])} />}
      {compareOpen && <CompareModal products={compareProducts} onClose={() => setCompareOpen(false)} onOpenDetail={(p) => { setCompareOpen(false); openProduct(p); }} />}

      {addConsignModalOpen && <AddConsignmentModal onClose={() => setAddConsignModalOpen(false)} onSubmit={addConsignment} />}
      {confirmedBooking && <ConfirmedModal booking={confirmedBooking} onClose={() => { setConfirmedBooking(null); setScreen("myRentals"); }} />}
      {qrBooking && <QRModal booking={qrBooking} onClose={() => setQrBooking(null)} onConfirm={() => { updateBooking(qrBooking.id, { handoverStage: "picked_up" }); setQrBooking(null); }} />}
      {returnBooking && (() => {
        const product = catalog.find((p) => p.id === returnBooking.productId);
        return <ReturnChecklistModal booking={{ ...returnBooking, product }} onClose={() => setReturnBooking(null)} onConfirm={() => { updateBooking(returnBooking.id, { status: "completed", handoverStage: "returned" }); setReturnBooking(null); }} />;
      })()}
    </div>
  );
}