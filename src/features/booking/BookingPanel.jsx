import { useState } from "react";
import { T, F } from "../../theme/tokens";
import { money, moneyShort } from "../../utils/format";
import { savingsFor } from "../../utils/productMetrics";
import useBookingPricing from "../../hooks/useBookingPricing";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { PrimaryButton } from "../../components/ui/Button";
import { MapPin, Truck, Wallet, ArrowRight } from "lucide-react";

const PICKUP_OPTIONS = [
  { id: "self", label: "Tự đến lấy", icon: MapPin },
  { id: "delivery", label: "Giao tận nơi", icon: Truck },
];

// Booking card with a live availability calendar, pickup mode, and price breakdown.
export default function BookingPanel({ product, onConfirm }) {
  const [start, setStart] = useState("2026-08-15");
  const [end, setEnd] = useState("2026-08-18");
  const [pickup, setPickup] = useState("self");

  // Calendar interaction: first pick sets start, later pick sets end (or restarts).
  const pick = (dateStr) => {
    const d = Number(dateStr.split("-")[2]);
    const s = start ? Number(start.split("-")[2]) : null;
    if (!s || (start && end)) { setStart(dateStr); setEnd(""); }
    else if (d > s) setEnd(dateStr);
    else setStart(dateStr);
  };

  const { nights, rentalCost, deliveryFee, total, valid } = useBookingPricing({
    start, end, pickup, price: product.price, deposit: product.deposit,
  });
  const savings = savingsFor(product, Math.max(nights, 5));

  return (
    <div style={{ position: "sticky", top: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 4 }}>
        <span style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: T.ink }}>{money(product.price)}</span>
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>/ ngày</span>
      </div>
      <p style={{ fontFamily: F.body, fontSize: 11, color: T.green, margin: "0 0 14px" }}>
        💰 Mua mới {moneyShort(product.buyPrice)} — thuê tiết kiệm ~{savings.pct}%
      </p>

      <AvailabilityCalendar product={product} start={start} end={end} onPick={pick} />

      <p style={{ fontFamily: F.mono, fontSize: 12, color: T.inkSoft, margin: "10px 0 0" }}>
        {start ? start.slice(5).split("-").reverse().join("/") : "—"} → {end ? end.slice(5).split("-").reverse().join("/") : "—"}
        {valid && <span style={{ color: T.inkFaint }}> ({nights} đêm)</span>}
      </p>
      {!valid && <p style={{ fontFamily: F.body, fontSize: 11, color: T.danger, marginTop: 4 }}>Chọn ngày nhận rồi chọn ngày trả trên lịch.</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {PICKUP_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = pickup === opt.id;
          return (
            <button key={opt.id} onClick={() => setPickup(opt.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px",
              borderRadius: 10, border: `1.5px solid ${isActive ? T.ink : T.line}`, background: isActive ? T.ink : T.bg, cursor: "pointer",
            }}>
              <Icon size={14} color={isActive ? "#fff" : T.inkSoft} />
              <span style={{ fontFamily: F.body, fontSize: 10.5, fontWeight: 500, color: isActive ? "#fff" : T.inkSoft }}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14, padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg }}>
        <Wallet size={14} color={T.teal} />
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.ink }}>Thanh toán demo (mock)</span>
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${T.line}` }}>
        {[
          [`${Math.max(nights, 0)} đêm × ${money(product.price)}`, money(Math.max(rentalCost, 0))],
          ["Tiền cọc (hoàn lại)", money(product.deposit)],
          ...(pickup === "delivery" ? [["Phí giao hàng", money(deliveryFee)]] : []),
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
      </div>

      <PrimaryButton style={{ marginTop: 16 }} disabled={!valid} onClick={() => onConfirm({ product, start, end, nights, total, pickup })} icon={ArrowRight}>
        Xác nhận thuê
      </PrimaryButton>
    </div>
  );
}
