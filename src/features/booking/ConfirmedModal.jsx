import { T, F } from "../../theme/tokens";
import Modal from "../../components/ui/Modal";
import { PrimaryButton } from "../../components/ui/Button";
import { Check, Package } from "lucide-react";

// Success dialog shown after a booking request is placed.
export default function ConfirmedModal({ booking, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 4px" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={27} color={T.teal} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>Đã gửi yêu cầu thuê</h2>
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, lineHeight: 1.6, margin: "0 0 20px" }}>
          {booking.product.owner.name} sẽ xác nhận đơn "{booking.product.name}" của bạn sớm thôi.
        </p>
        <PrimaryButton onClick={onClose} icon={Package}>Xem đơn thuê của tôi</PrimaryButton>
      </div>
    </Modal>
  );
}
