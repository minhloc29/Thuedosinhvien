import { useMemo } from "react";
import { T, F } from "../../theme/tokens";
import Modal from "../../components/ui/Modal";
import { PrimaryButton } from "../../components/ui/Button";
import { Check } from "lucide-react";

// Fake QR code grid (decorative placeholder for the pickup handover flow).
export function QRPattern() {
  const cells = useMemo(() => Array.from({ length: 121 }, () => Math.random() > 0.55), []);
  return (
    <div style={{ width: 160, height: 160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 2, padding: 10, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10 }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? T.ink : "transparent" }} />)}
    </div>
  );
}

// Pickup confirmation dialog shown before the lender hands the item over.
export function QRModal({ booking, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose} width={360}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>Xác nhận nhận đồ</p>
        <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "0 0 16px" }}>Đơn #{booking.id.slice(-5).toUpperCase()} · {booking.product.name}</p>
        <QRPattern />
        <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "14px 0 18px" }}>Chủ món đồ quét mã này để xác nhận bàn giao.</p>
        <PrimaryButton onClick={onConfirm} icon={Check}>Đã quét — xác nhận nhận đồ</PrimaryButton>
      </div>
    </Modal>
  );
}
