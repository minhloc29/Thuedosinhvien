import { T, F } from "../../theme/tokens";
import { SecondaryButton } from "../ui/Button";
import { Home as HomeIcon, User, Package, Tag, Plus, Scale } from "lucide-react";

const RENTER_ITEMS = [
  { id: "home", label: "Trang chủ", icon: HomeIcon },
  { id: "myRentals", label: "Đơn của tôi", icon: Package },
  { id: "profile", label: "Cá nhân", icon: User },
];

const OWNER_ITEMS = [
  { id: "home", label: "Trang chủ", icon: HomeIcon },
  { id: "requests", label: "Yêu cầu thuê", icon: Package, badgeKey: "pendingCount" },
  { id: "myListings", label: "Tin đăng của tôi", icon: Tag },
  { id: "profile", label: "Cá nhân", icon: User },
];

const ROLES = [
  { id: "renter", label: "Người thuê" },
  { id: "owner", label: "Chủ đồ" },
];

// Primary navigation rail; switches between renter/owner modes.
export default function Sidebar({ screen, setScreen, role, setRole, pendingCount, compareCount, onAdd, onExit }) {
  const items = role === "renter" ? RENTER_ITEMS : OWNER_ITEMS;

  return (
    <aside className="rm-sidebar" style={{ background: T.surface, borderRight: `1px solid ${T.line}`, padding: "24px 16px", display: "flex", flexDirection: "column" }}>
      <button
        onClick={onExit}
        title="Về trang chủ"
        style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px 26px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 9, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
          🏷️
        </div>
        <span style={{ fontFamily: F.display, fontSize: 16.5, fontWeight: 700, color: T.ink }}>Thuê Đồ</span>
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = screen === it.id;
          const badge = it.badgeKey ? pendingCount : null;
          return (
            <button
              key={it.id}
              onClick={() => setScreen(it.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10,
                border: "none", background: isActive ? T.bg : "transparent", cursor: "pointer", textAlign: "left",
                position: "relative",
              }}
            >
              <Icon size={17} color={isActive ? T.ink : T.inkFaint} strokeWidth={isActive ? 2.3 : 1.8} />
              <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? T.ink : T.inkSoft, flex: 1 }}>
                {it.label}
              </span>
              {!!badge && (
                <span style={{
                  background: T.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10,
                  minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {role === "owner" && (
        <SecondaryButton onClick={onAdd} icon={Plus} style={{ marginTop: 14, width: "100%" }}>
          Đăng đồ
        </SecondaryButton>
      )}
      {compareCount > 0 && (
        <div style={{ marginTop: 10, padding: "9px 10px", borderRadius: 10, background: T.accentBg, display: "flex", alignItems: "center", gap: 8 }}>
          <Scale size={14} color={T.accentDeep} />
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.accentDeep }}>{compareCount} sản phẩm để so sánh</span>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.inkFaint, margin: "0 0 6px 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
          Chế độ
        </p>
        <div style={{ display: "flex", background: T.bg, borderRadius: 10, padding: 3 }}>
          {ROLES.map((r) => {
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setScreen("home"); }}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                  background: isActive ? T.accent : "transparent", color: isActive ? "#fff" : T.inkSoft,
                  fontFamily: F.body, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "16px 6px 0" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", background: T.accentBg, display: "flex",
            alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 700, fontSize: 12.5, color: T.accentDeep,
          }}>
            A
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: T.ink, margin: 0, whiteSpace: "nowrap" }}>Nguyễn Văn A</p>
            <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.inkFaint, margin: 0 }}>Bách Khoa Hà Nội</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
