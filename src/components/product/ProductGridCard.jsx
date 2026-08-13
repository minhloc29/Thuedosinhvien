import Card from "../ui/Card";
import MatchBadge from "../ui/MatchBadge";
import { T, F } from "../../theme/tokens";
import { money } from "../../utils/format";
import { savingsFor, MATCH_BADGES } from "../../utils/productMetrics";
import { Star, MapPin, ArrowRight, Scale, Check } from "lucide-react";

// Compact catalog tile: match badge, compare toggle, and savings hint.
export default function ProductGridCard({ p, onClick, compareChecked, onToggleCompare }) {
  const savings = savingsFor(p);
  const badge = MATCH_BADGES[p.id];
  return (
    <Card onClick={onClick}>
      <div style={{ height: 130, borderRadius: "14px 14px 0 0", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
        <MatchBadge badge={badge} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(p.id); }}
          title="Thêm vào so sánh"
          style={{
            position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: 7, zIndex: 2,
            border: `1.5px solid ${compareChecked ? T.ink : T.line}`, background: compareChecked ? T.ink : "rgba(255,255,255,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          {compareChecked ? <Check size={13} color="#fff" /> : <Scale size={12} color={T.inkFaint} />}
        </button>
        {p.emoji}
      </div>
      <div style={{ padding: "13px 14px 14px", borderTop: `1px dashed ${T.line}` }}>
        <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: 0 }}>{p.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
          <Star size={11} fill={T.accent} color={T.accent} />
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkSoft }}>{p.rating} · {p.reviewCount} đánh giá</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
          <MapPin size={11} color={T.inkFaint} />
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint }}>{p.location} · {p.distance}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: T.accentDeep }}>
            {money(p.price)}<span style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 400 }}>/ngày</span>
          </span>
          <ArrowRight size={14} color={T.inkFaint} />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 10.5, color: T.green, margin: "6px 0 0" }}>
          💰 Tiết kiệm ~{savings.pct}% so với mua mới
        </p>
      </div>
    </Card>
  );
}
