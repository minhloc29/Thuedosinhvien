import { T, F } from "../../theme/tokens";
import { Check, X } from "lucide-react";

// What's included (green chips) vs. not included (grey chips) in a rental.
export default function IncludedCard({ product }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: "0 0 10px" }}>Bao gồm những gì?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {product.included.map((it, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.green, background: T.greenBg, padding: "5px 10px", borderRadius: 20 }}>
            <Check size={11} /> {it}
          </span>
        ))}
        {product.notIncluded.map((it, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, background: T.bg, padding: "5px 10px", borderRadius: 20 }}>
            <X size={11} /> {it}
          </span>
        ))}
      </div>
    </div>
  );
}
