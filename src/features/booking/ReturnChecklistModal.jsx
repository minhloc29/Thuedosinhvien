import { useState } from "react";
import { T, F } from "../../theme/tokens";
import Modal from "../../components/ui/Modal";
import { PrimaryButton } from "../../components/ui/Button";
import { Check } from "lucide-react";

const RETURN_ITEMS = [
  { k: "item", make: (p) => `${p.name} còn nguyên vẹn` },
  { k: "charger", make: () => "Phụ kiện đi kèm đầy đủ" },
  { k: "damage", make: () => "Không có hư hỏng phát sinh" },
];

// Return confirmation checklist; submit enabled only when all boxes are checked.
export default function ReturnChecklistModal({ booking, onClose, onConfirm }) {
  const [checks, setChecks] = useState({ item: false, charger: false, damage: false });
  const allChecked = Object.values(checks).every(Boolean);
  const toggle = (k) => setChecks((c) => ({ ...c, [k]: !c[k] }));

  return (
    <Modal onClose={onClose} width={380}>
      <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 14px" }}>Xác nhận trả đồ</p>
      {RETURN_ITEMS.map((r) => (
        <label key={r.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", cursor: "pointer" }}>
          <input type="checkbox" checked={checks[r.k]} onChange={() => toggle(r.k)} style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink }}>{r.make(booking.product)}</span>
        </label>
      ))}
      <PrimaryButton style={{ marginTop: 14 }} disabled={!allChecked} onClick={onConfirm} icon={Check}>Xác nhận trả đồ</PrimaryButton>
    </Modal>
  );
}
