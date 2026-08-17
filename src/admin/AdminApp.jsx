// ---------------------------------------------------------------------------
// LabShare Admin — separate frontend served at /admin.html.
// Admin-only: only accounts with isAdmin:true can get past the login gate.
// Screens: Chờ thẩm định, Đơn thuê chờ duyệt, Tổng quan vận hành (sổ cái),
// Cá nhân. Live data from the /api/admin/* endpoints via the shared session.
// ---------------------------------------------------------------------------
import React, { useState, useEffect, useMemo } from "react";
import {
  X, Check, ClipboardCheck, Package, BarChart3, User, ShieldCheck,
  Tag, Wallet, ArrowRight
} from "../lib/icons";
import {
  T, F, GLOBAL_CSS, CATS, catInfo, money,
  SESSION_TOKEN, SESSION_USER, setSession, api,
  INSURANCE_FEE, PICKUP_POINTS,
  fieldStyle, labelStyle, StatusBadge, GradeBadge, Card, PrimaryButton, SecondaryButton, PageHeader, Modal,
} from "../lib/shared.jsx";

// --- fallback seed (used only when the API is unreachable) -----------------
const seedConsignments = [
  { id: "c1", name: "Kit ESP32 DevKit + màn OLED", category: "vi-dieu-khien", emoji: "🔧", seniorName: "Hải Nam (K66)", estimatedValue: 350000, desc: "Bộ ESP32 kèm màn OLED 0.96 inch, đã test WiFi/Bluetooth ổn định.", dateSubmitted: "15/08/2026", status: "pending" },
  { id: "c2", name: "Multimeter Fluke 17B+", category: "do-luong", emoji: "📟", seniorName: "Đức Anh (K66)", estimatedValue: 2200000, desc: "Đồng hồ vạn năng Fluke, đo chính xác, còn bảo hành hãng.", dateSubmitted: "14/08/2026", status: "pending" },
];

const seedBookings = [
  { id: "b_seed1", product: { id: "p1", name: "Oscilloscope Rigol DS1102Z-E", emoji: "📟" }, renterName: "Hải Đăng (K68)", start: "2026-08-18", end: "2026-08-20", total: 600000, pickupName: "KTX Bách Khoa – Nhà B2", status: "pending" },
];

// ---------------------------------------------------------------------------
// Admin login gate
// ---------------------------------------------------------------------------
function AdminAuthScreen({ onLogin }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doAuth = (emailVal, passwordVal) => {
    setBusy(true); setError("");
    fetch("/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailVal, password: passwordVal }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return setError(j.error || "Đăng nhập thất bại");
        // Admin app accepts ONLY admin accounts.
        if (!j.user || !j.user.isAdmin) {
          return setError("Tài khoản này không có quyền quản trị. Vui lòng dùng app người dùng.");
        }
        setSession(j.token, j.user);
        onLogin(j.user);
      })
      .catch(() => setError("Không kết nối được server."))
      .finally(() => setBusy(false));
  };

  const submit = (e) => { e.preventDefault(); if (!email || !password) return setError("Nhập email và mật khẩu."); doAuth(email.trim(), password); };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card style={{ width: "100%", maxWidth: 380, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <ShieldCheck size={20} color={T.teal} />
          <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 19, color: T.ink }}>LabShare · Quản trị</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, margin: "2px 0 18px" }}>Chỉ tài khoản admin mới được vào.</p>

        <form onSubmit={submit}>
          <label style={labelStyle}>Email admin</label>
          <input style={fieldStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@labshare.vn" />
          <label style={{ ...labelStyle, display: "block", marginTop: 12 }}>Mật khẩu</label>
          <input style={fieldStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p style={{ fontFamily: F.body, fontSize: 12, color: T.danger, marginTop: 10 }}>{error}</p>}
          <PrimaryButton style={{ marginTop: 16 }} disabled={busy}>{busy ? "Đang xử lý…" : "Đăng nhập quản trị"}</PrimaryButton>
        </form>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${T.line}` }}>
          <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "0 0 8px" }}>Đăng nhập nhanh (demo):</p>
          <button onClick={() => doAuth("admin@labshare.vn", "password123")} disabled={busy} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
            borderRadius: 9, border: `1px solid ${T.line}`, background: T.surface, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 16 }}>🛠️</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: T.ink }}>LabShare Admin</span>
              <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.inkFaint }}>admin@labshare.vn</span>
            </span>
          </button>
        </div>

        <a href="/" style={{ display: "inline-block", marginTop: 18, fontFamily: F.body, fontSize: 12, color: T.inkFaint, textDecoration: "none" }}>← Về app người dùng</a>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin — appraisal modal + queue
// ---------------------------------------------------------------------------
function AppraisalModal({ item, onClose, onApprove, onReject }) {
  const [grade, setGrade] = useState("A");
  const [price, setPrice] = useState(Math.round(item.estimatedValue * 0.01 / 5000) * 5000 || 20000);
  const [marketValue, setMarketValue] = useState(item.estimatedValue);
  const [splitSenior, setSplitSenior] = useState(item.estimatedValue > 2000000 ? 60 : 50);
  const sealCode = useMemo(() => "LS-0" + Math.floor(200 + Math.random() * 90), []);

  return (
    <Modal onClose={onClose} width={460}>
      <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 4px" }}>Thẩm định ký gửi</h2>
      <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, margin: "0 0 16px" }}>{item.name} · Ký gửi bởi {item.seniorName}</p>

      <div style={{ background: T.bg, borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
        <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "8px 0 0" }}>Giá trị Senior khai báo: {money(item.estimatedValue)} · Gửi ngày {item.dateSubmitted}</p>
      </div>

      <label style={labelStyle}>Phân hạng</label>
      <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
        {["A", "B"].map((g) => (
          <button key={g} onClick={() => setGrade(g)} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${grade === g ? T.ink : T.line}`,
            background: grade === g ? T.ink : T.surface, color: grade === g ? "#fff" : T.inkSoft,
            fontFamily: F.display, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>Hạng {g}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Giá trị thị trường xác nhận (đ)</label>
          <input type="number" style={fieldStyle} value={marketValue} onChange={(e) => setMarketValue(Number(e.target.value))} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Giá thuê / ngày (đ)</label>
          <input type="number" style={fieldStyle} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
      </div>

      <label style={{ ...labelStyle, display: "block", marginTop: 14 }}>Tỉ lệ chia sẻ doanh thu — Senior nhận {splitSenior}% / LabShare {100 - splitSenior}%</label>
      <input type="range" min={40} max={70} step={10} value={splitSenior} onChange={(e) => setSplitSenior(Number(e.target.value))} style={{ width: "100%", marginTop: 6 }} />

      <div style={{ marginTop: 14, padding: "10px 12px", background: T.purpleBg, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.purple }}>Mã niêm phong sẽ cấp</span>
        <span style={{ fontFamily: F.mono, fontSize: 12.5, fontWeight: 600, color: T.purple }}>{sealCode}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <SecondaryButton onClick={() => onReject(item.id)} icon={X} style={{ flex: 1 }}>Từ chối</SecondaryButton>
        <PrimaryButton onClick={() => onApprove(item.id, { grade, price, marketValue, splitSenior, splitPlatform: 100 - splitSenior, sealCode })} icon={Check} style={{ flex: 1.4 }}>
          Duyệt & niêm phong
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function AppraisalQueueScreen({ items, onSelect }) {
  return (
    <div>
      <PageHeader title="Chờ thẩm định" subtitle="Thiết bị Senior vừa ký gửi, chờ LabShare kiểm tra, phân hạng và niêm phong." />
      {items.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>✅</p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Không có ký gửi nào đang chờ</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it) => (
            <Card key={it.id} onClick={() => onSelect(it)} style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28 }}>{it.emoji || catInfo(it.category).emoji}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: 0 }}>{it.name}</p>
                <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "3px 0 0" }}>Ký gửi bởi {it.seniorName} · {it.dateSubmitted}</p>
                <p style={{ fontFamily: F.mono, fontSize: 11.5, color: T.inkFaint, margin: "2px 0 0" }}>Khai báo: {money(it.estimatedValue)}</p>
              </div>
              <StatusBadge status="appraisal_pending" />
              <ArrowRight size={15} color={T.inkFaint} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin — rental requests
// ---------------------------------------------------------------------------
function RentalRequestsScreen({ bookings, onRespond }) {
  const pending = bookings.filter((b) => b.status === "pending");
  return (
    <div>
      <PageHeader title="Đơn thuê chờ duyệt" subtitle="Xác nhận khả năng đáp ứng và chuẩn bị thiết bị tại điểm hẹn." />
      {pending.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>📭</p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Không có đơn nào chờ duyệt</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((b) => (
            <Card key={b.id} style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28 }}>{b.product?.emoji || "📦"}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: 0 }}>{b.product?.name || "Thiết bị"}</p>
                <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "3px 0 0" }}>Từ {b.renterName}</p>
                <p style={{ fontFamily: F.mono, fontSize: 11, color: T.inkFaint, margin: "2px 0 0" }}>{b.start} → {b.end}{b.pickupName ? ` · ${b.pickupName}` : ""}</p>
              </div>
              <StatusBadge status={b.status} />
              <div style={{ display: "flex", gap: 8 }}>
                <SecondaryButton onClick={() => onRespond(b.id, "rejected")} icon={X}>Từ chối</SecondaryButton>
                <PrimaryButton onClick={() => onRespond(b.id, "confirmed")} icon={Check} style={{ width: "auto", padding: "10px 16px" }}>Xác nhận</PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin — overview (stats + ledger)
// ---------------------------------------------------------------------------
const LEDGER_LABELS = {
  rental_revenue: { t: "Phí thuê", c: T.green },
  insurance_fee: { t: "Phí bảo hiểm", c: T.teal },
  deposit_hold: { t: "Giữ cọc", c: T.accentDeep },
  deposit_release: { t: "Hoàn cọc", c: T.purple },
  senior_payout: { t: "Chia sẻ senior", c: T.accentDeep },
  repair_fee: { t: "Phí sửa chữa", c: T.danger },
  liquidation: { t: "Thanh lý", c: T.danger },
};

function OverviewScreen() {
  const [stats, setStats] = useState(null);
  const [ledger, setLedger] = useState(null);
  useEffect(() => {
    let active = true;
    api("/admin/stats").then(({ stats }) => active && setStats(stats)).catch(() => {});
    api("/admin/ledger").then(({ ledger }) => active && setLedger(ledger)).catch(() => {});
    return () => { active = false; };
  }, []);

  const cards = [
    { label: "Thiết bị đang cho thuê", value: stats ? stats.activeItems : "…", icon: Tag, color: T.teal },
    { label: "Đơn đang hoạt động", value: stats ? stats.activeBookings : "…", icon: Package, color: T.accentDeep },
    { label: "Quỹ bảo hiểm hiện có", value: stats ? money(Math.round(stats.insuranceFund)) : "…", icon: ShieldCheck, color: T.purple },
    { label: "Doanh thu LabShare", value: stats ? money(Math.round(stats.realizedRevenue)) : "…", icon: BarChart3, color: T.green },
  ];

  return (
    <div>
      <PageHeader title="Tổng quan vận hành" subtitle="Số liệu tổng hợp cho đội ngũ LabShare." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 20 }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} style={{ padding: 18 }}>
              <Icon size={18} color={c.color} />
              <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.ink, margin: "10px 0 0" }}>{c.value}</p>
              <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "2px 0 0" }}>{c.label}</p>
            </Card>
          );
        })}
      </div>

      {stats && stats.seniorPaidOut > 0 && (
        <Card style={{ padding: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: 0 }}>Đã chi trả cho Senior</p>
            <p style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.green, margin: "2px 0 0" }}>{money(stats.seniorPaidOut)}</p>
          </div>
          <Wallet size={22} color={T.green} />
        </Card>
      )}

      {stats && stats.pendingAppraisals > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.purpleBg, borderRadius: 12, marginBottom: 16 }}>
          <ClipboardCheck size={16} color={T.purple} />
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.purple }}>{stats.pendingAppraisals} thiết bị ký gửi đang chờ thẩm định.</span>
        </div>
      )}

      {ledger && ledger.length > 0 && (
        <Card style={{ padding: 16 }}>
          <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Sổ cái gần đây</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ledger.slice(0, 8).map((r) => {
              const meta = LEDGER_LABELS[r.type] || { t: r.type, c: T.inkSoft };
              return (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px dashed ${T.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.c }} />
                    <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>{meta.t}</span>
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: T.ink }}>{money(r.amount)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin — profile
// ---------------------------------------------------------------------------
function AdminProfileScreen({ onLogout }) {
  const initial = (SESSION_USER?.name || "A").charAt(0).toUpperCase();
  return (
    <div>
      <PageHeader title="Cá nhân" />
      <Card style={{ padding: 20, maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.accentDeep }}>{initial}</div>
          <div>
            <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>{SESSION_USER?.name || "Admin"}</p>
            <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "2px 0 0" }}>{SESSION_USER?.email || ""} · Quản trị viên LabShare</p>
          </div>
        </div>
        <button onClick={onLogout} style={{
          marginTop: 20, width: "100%", padding: "10px 0", borderRadius: 10,
          border: `1.5px solid ${T.line}`, background: T.surface, color: T.inkSoft,
          fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Đăng xuất</button>
        <a href="/" style={{ display: "inline-block", marginTop: 12, fontFamily: F.body, fontSize: 12, color: T.inkFaint, textDecoration: "none" }}>← Về app người dùng</a>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
function AdminSidebar({ screen, setScreen, pendingCount, appraisalCount }) {
  const items = [
    { id: "appraisalQueue", label: "Chờ thẩm định", icon: ClipboardCheck, badge: appraisalCount },
    { id: "rentalRequests", label: "Đơn thuê chờ duyệt", icon: Package, badge: pendingCount },
    { id: "overview", label: "Tổng quan vận hành", icon: BarChart3 },
    { id: "profile", label: "Cá nhân", icon: User },
  ];
  return (
    <aside className="rm-sidebar" style={{ background: T.surface, borderRight: `1px solid ${T.line}`, padding: "24px 16px", display: "flex", flexDirection: "column" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px 26px", textDecoration: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📦</div>
        <span style={{ fontFamily: F.display, fontSize: 16.5, fontWeight: 700, color: T.ink }}>LabShare · Admin</span>
      </a>
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = screen === it.id;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10,
              border: "none", background: isActive ? T.bg : "transparent", cursor: "pointer", textAlign: "left",
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
      <a href="/" style={{ marginTop: "auto", padding: "9px 10px", fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        ← App người dùng
      </a>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function AdminApp() {
  const [screen, setScreen] = useState("appraisalQueue");
  const [authStatus, setAuthStatus] = useState(() => (SESSION_TOKEN ? "loading" : "out"));
  const [denied, setDenied] = useState(false);

  const [consignments, setConsignments] = useState(seedConsignments);
  const [bookings, setBookings] = useState(seedBookings);
  const [appraisalItem, setAppraisalItem] = useState(null);

  // Bootstrap: verify the token is a real ADMIN session; otherwise lock out.
  useEffect(() => {
    if (!SESSION_TOKEN) return;
    let active = true;
    fetch("/auth/me", { headers: { Authorization: "Bearer " + SESSION_TOKEN } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad token"))))
      .then(({ user }) => {
        if (!active) return;
        if (!user.isAdmin) { setSession(null, null); setDenied(true); setAuthStatus("out"); return; }
        setSession(SESSION_TOKEN, user);
        setAuthStatus("in");
      })
      .catch(() => { if (!active) return; setSession(null, null); setAuthStatus("out"); });
    return () => { active = false; };
  }, []);

  // Hydrate live data (admin-only endpoints; backend rejects non-admin tokens).
  useEffect(() => {
    if (authStatus !== "in") return;
    const load = () => {
      api("/admin/consignments").then(({ consignments }) => setConsignments(consignments)).catch(() => {});
      api("/admin/bookings").then(({ bookings }) => setBookings(bookings)).catch(() => {});
    };
    load();
  }, [authStatus]);

  // Ops
  const approveAppraisal = (id, appraisal) => {
    setConsignments((list) => list.map((c) => (c.id === id ? { ...c, status: "approved" } : c)));
    setAppraisalItem(null);
    api(`/admin/consignments/${id}/approve`, {}, {
      grade: appraisal.grade, pricePerDay: appraisal.price,
      marketValue: appraisal.marketValue, splitSeniorPct: appraisal.splitSenior,
      splitPlatformPct: appraisal.splitPlatform, sealCode: appraisal.sealCode,
    }).catch(() => { /* keep local */ });
  };
  const rejectAppraisal = (id) => {
    setConsignments((list) => list.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)));
    setAppraisalItem(null);
    api(`/admin/consignments/${id}/reject`).catch(() => {});
  };
  const respondRentalRequest = (id, status) => {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    api(`/admin/bookings/${id}/${status}`).catch(() => { /* keep local */ });
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const appraisalCount = consignments.filter((c) => c.status === "pending").length;

  let body;
  if (screen === "appraisalQueue") {
    body = <AppraisalQueueScreen items={consignments.filter((c) => c.status === "pending")} onSelect={setAppraisalItem} />;
  } else if (screen === "rentalRequests") {
    body = <RentalRequestsScreen bookings={bookings} onRespond={respondRentalRequest} />;
  } else if (screen === "overview") {
    body = <OverviewScreen />;
  } else {
    body = <AdminProfileScreen onLogout={() => { setSession(null, null); setAuthStatus("out"); }} />;
  }

  if (authStatus === "loading") {
    return <div style={{ minHeight: "100vh", background: T.bg, fontFamily: F.body }} />;
  }
  if (authStatus === "out") {
    return <AdminAuthScreen onLogin={() => setAuthStatus("in")} />;
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: F.body }}>
      <style>{GLOBAL_CSS}</style>
      <div className="rm-shell">
        <AdminSidebar screen={screen} setScreen={setScreen} pendingCount={pendingCount} appraisalCount={appraisalCount} />
        <main className="rm-main" style={{ padding: "28px 32px 90px", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
          {body}
        </main>
      </div>
      {appraisalItem && <AppraisalModal item={appraisalItem} onClose={() => setAppraisalItem(null)} onApprove={approveAppraisal} onReject={rejectAppraisal} />}
    </div>
  );
}
