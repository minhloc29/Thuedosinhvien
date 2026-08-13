import { T, F } from "../../theme/tokens";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const ROLES = [
  { id: "renter", label: "Người thuê" },
  { id: "owner", label: "Chủ đồ" },
];

// User profile: identity card + mode switch.
export default function ProfileScreen({ role, setRole, listingsCount, bookingsCount }) {
  return (
    <div>
      <PageHeader title="Cá nhân" />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Card style={{ padding: 20, flex: "1 1 280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.accentDeep }}>A</div>
            <div>
              <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>Nguyễn Văn A</p>
              <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "2px 0 0" }}>Sinh viên · Bách Khoa Hà Nội</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <div style={{ flex: 1, background: T.bg, borderRadius: 12, padding: 12, textAlign: "center" }}>
              <p style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: 0 }}>{bookingsCount}</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "2px 0 0" }}>Đơn đã thuê</p>
            </div>
            <div style={{ flex: 1, background: T.bg, borderRadius: 12, padding: 12, textAlign: "center" }}>
              <p style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: 0 }}>{listingsCount}</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: "2px 0 0" }}>Tin đang đăng</p>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 20, flex: "1 1 280px" }}>
          <p style={{ fontFamily: F.display, fontSize: 14.5, fontWeight: 600, color: T.ink, margin: "0 0 12px" }}>Chế độ sử dụng</p>
          <div style={{ display: "flex", gap: 10 }}>
            {ROLES.map((r) => {
              const isActive = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(r.id)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 12, border: `1.5px solid ${isActive ? T.accent : T.line}`,
                  background: isActive ? T.accent : T.bg, color: isActive ? "#fff" : T.inkSoft,
                  fontFamily: F.body, fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                  {r.label}
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, marginTop: 14, lineHeight: 1.6 }}>
            Chuyển sang "Chủ đồ" để đăng thiết bị cho thuê và duyệt yêu cầu từ người thuê khác.
          </p>
        </Card>
      </div>
    </div>
  );
}
