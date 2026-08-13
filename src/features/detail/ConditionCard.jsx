import { T, F } from "../../theme/tokens";

// Per-part condition breakdown + last inspection date.
export default function ConditionCard({ product }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: 0 }}>Tình trạng thiết bị</p>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.green, background: T.greenBg, padding: "3px 9px", borderRadius: 20 }}>
          🟢 {product.condition}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {product.conditionDetails.map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 12 }}>
            <span style={{ color: T.inkFaint }}>{d.label}</span>
            <span style={{ color: T.ink, fontWeight: 500 }}>{d.value}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.inkFaint, margin: "12px 0 0" }}>Lần kiểm tra gần nhất: {product.lastInspected}</p>
    </div>
  );
}
