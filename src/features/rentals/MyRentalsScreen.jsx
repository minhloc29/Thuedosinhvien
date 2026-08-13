import { T, F } from "../../theme/tokens";
import { money } from "../../utils/format";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import { SecondaryButton } from "../../components/ui/Button";
import RentalTimeline from "./RentalTimeline";

const badgeStatus = (b) =>
  b.status === "confirmed" && b.handoverStage === "picked_up" ? "picked_up" : b.status;

// Renter view: bookings with a lifecycle timeline + handover actions.
export default function MyRentalsScreen({ bookings, onOpenQR, onOpenReturn }) {
  return (
    <div>
      <PageHeader title="Đơn thuê của tôi" subtitle="Theo dõi trạng thái các món đồ bạn đã thuê." />
      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>📦</p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Chưa có đơn thuê nào</p>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, marginTop: 6 }}>Tìm món đồ ở trang chủ để bắt đầu thuê.</p>
        </div>
      ) : (
        <div className="rm-grid">
          {bookings.map((b) => (
            <Card key={b.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 30 }}>{b.product.emoji}</div>
                <StatusBadge status={badgeStatus(b)} />
              </div>
              <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: "10px 0 0" }}>{b.product.name}</p>
              <p style={{ fontFamily: F.mono, fontSize: 11.5, color: T.inkFaint, margin: "4px 0 0" }}>{b.start} → {b.end}</p>

              {b.status !== "rejected" && <RentalTimeline booking={b} />}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
                <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint }}>Tổng</span>
                <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: T.ink }}>{money(b.total)}</span>
              </div>

              {b.status === "confirmed" && !b.handoverStage && (
                <SecondaryButton onClick={() => onOpenQR(b)} style={{ width: "100%", marginTop: 10 }}>Xác nhận nhận đồ (quét QR)</SecondaryButton>
              )}
              {b.status === "confirmed" && b.handoverStage === "picked_up" && (
                <SecondaryButton onClick={() => onOpenReturn(b)} style={{ width: "100%", marginTop: 10 }}>Trả đồ</SecondaryButton>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
