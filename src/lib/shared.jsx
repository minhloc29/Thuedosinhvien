// ---------------------------------------------------------------------------
// LabShare — shared building blocks for BOTH frontends (user app + admin).
// Single source of truth for design tokens, session/auth helpers and the
// small presentational components both apps reuse.
// ---------------------------------------------------------------------------
import React, { useMemo } from "react";
import { Star, StarBorder, X, ArrowRight } from "../lib/icons";

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
  display: `'Fraunces', ui-serif, 'New York', Georgia, 'Times New Roman', serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  mono: `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`,
};

const CATS = [
  { id: "do-luong", label: "Đo lường", emoji: "📟" },
  { id: "vi-dieu-khien", label: "Vi điều khiển", emoji: "🔧" },
  { id: "plc", label: "PLC/Tự động hoá", emoji: "⚙️" },
  { id: "khac", label: "Khác", emoji: "🧰" },
];
const catInfo = (id) => CATS.find((c) => c.id === id) || CATS[0];
const money = (n) => Math.round(n).toLocaleString("vi-VN") + "đ";
const moneyShort = (n) => (n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "tr" : Math.round(n / 1000) + "k");

// ---------------------------------------------------------------------------
// Session / auth. Shared with both apps so a refresh keeps the login. The
// token is validated against /auth/me by each app's bootstrap gate.
// ---------------------------------------------------------------------------
let CURRENT_USER = "Minh Quân (K67)";
let CURRENT_USER_RENTER_LABEL = "Bạn (Minh Quân - K67)";

let SESSION_TOKEN = typeof localStorage !== "undefined" ? localStorage.getItem("labshare_token") || null : null;
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

// ---------------------------------------------------------------------------
// Constants used across screens
// ---------------------------------------------------------------------------
const INSURANCE_FEE = 15000;
const DEPOSIT_RATE = 0.65;
const PICKUP_POINTS = [
  { id: "ktx-b2", name: "KTX Bách Khoa – Nhà B2", hours: "07:00–21:00" },
  { id: "ktx-b9", name: "KTX Bách Khoa – Nhà B9", hours: "07:00–21:00" },
  { id: "c7", name: "Sảnh nhà C7 – Bách Khoa", hours: "08:00–18:00" },
  { id: "ta-quang-buu", name: "Ngõ 42 Tạ Quang Bửu (CTV Minh)", hours: "17:00–22:00" },
  { id: "me-tri", name: "KTX Mễ Trì – ĐHQGHN", hours: "07:00–21:00" },
];

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------
const fieldStyle = { width: "100%", padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.line}`, fontFamily: F.body, fontSize: 13, color: T.ink, background: T.bg, marginTop: 5, boxSizing: "border-box" };
const labelStyle = { fontFamily: F.body, fontSize: 11.5, color: T.inkSoft, fontWeight: 500 };

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

export {
  T, F, GLOBAL_CSS, CATS, catInfo, money, moneyShort,
  CURRENT_USER, CURRENT_USER_RENTER_LABEL, SESSION_TOKEN, SESSION_USER, setSession, api,
  INSURANCE_FEE, DEPOSIT_RATE, PICKUP_POINTS,
  fieldStyle, labelStyle, Stars, GradeBadge, StatusBadge, Card, PrimaryButton, SecondaryButton, PageHeader, Modal,
};
