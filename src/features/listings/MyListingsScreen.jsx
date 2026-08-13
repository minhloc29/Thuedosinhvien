import { T, F } from "../../theme/tokens";
import { money } from "../../utils/format";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import { PrimaryButton } from "../../components/ui/Button";
import { Plus } from "lucide-react";

// Owner view: equipment the user has published for rent.
export default function MyListingsScreen({ listings, onAdd }) {
  return (
    <div>
      <PageHeader
        title="Tin đăng của tôi"
        subtitle="Món đồ bạn đang cho sinh viên khác thuê."
        right={<PrimaryButton onClick={onAdd} icon={Plus} style={{ width: "auto", padding: "11px 18px" }}>Đăng món đồ</PrimaryButton>}
      />
      {listings.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>🏷️</p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Chưa có món đồ nào cho thuê</p>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, margin: "6px 0 16px" }}>
            Đăng món đồ đầu tiên để bắt đầu kiếm tiền từ đồ không dùng tới.
          </p>
          <PrimaryButton onClick={onAdd} icon={Plus} style={{ maxWidth: 220, margin: "0 auto" }}>Đăng đồ cho thuê</PrimaryButton>
        </div>
      ) : (
        <div className="rm-grid">
          {listings.map((p) => (
            <Card key={p.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 30 }}>{p.emoji}</div>
                <StatusBadge status="available" />
              </div>
              <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: "10px 0 0" }}>{p.name}</p>
              <p style={{ fontFamily: F.mono, fontSize: 12.5, color: T.accentDeep, margin: "4px 0 0" }}>{money(p.price)}/ngày</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
