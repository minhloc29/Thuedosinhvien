import { T, F } from "../../theme/tokens";
import { catInfo } from "../../data/categories";
import Stars from "../../components/ui/Stars";
import MatchBadge from "../../components/ui/MatchBadge";
import { MATCH_BADGES } from "../../utils/productMetrics";
import ConditionCard from "./ConditionCard";
import IncludedCard from "./IncludedCard";
import TrustPanel from "./TrustPanel";
import BookingPanel from "../booking/BookingPanel";
import { MapPin } from "lucide-react";

// Full product detail: condition/included/trust cards, reviews, and booking panel.
export default function DetailScreen({ product, onConfirm }) {
  if (!product) return null;
  const badge = MATCH_BADGES[product.id];
  return (
    <div className="rm-detail">
      <div>
        <div style={{ height: 220, borderRadius: 18, background: T.surface, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, marginBottom: 18, position: "relative" }}>
          <MatchBadge badge={badge} />
          {product.emoji}
        </div>

        <span style={{ fontFamily: F.body, fontSize: 10.5, fontWeight: 600, color: T.inkSoft, background: T.surface, border: `1px solid ${T.line}`, padding: "3px 9px", borderRadius: 20 }}>
          {catInfo(product.category).label}
        </span>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: T.ink, margin: "10px 0 6px" }}>{product.name}</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Stars count={5} size={13} />
            <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>{product.rating} ({product.reviewCount} đánh giá)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={13} color={T.inkFaint} />
            <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint }}>{product.location} · cách bạn {product.distance}</span>
          </div>
        </div>

        <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, margin: "16px 0 0" }}>{product.desc}</p>

        <ConditionCard product={product} />
        <IncludedCard product={product} />
        <TrustPanel owner={product.owner} />

        <div style={{ marginTop: 22 }}>
          <p style={{ fontFamily: F.display, fontSize: 14.5, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Đánh giá</p>
          {product.reviews.length === 0 && <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint }}>Chưa có đánh giá.</p>}
          {product.reviews.map((r, i) => (
            <div key={i} style={{ padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${T.line}` }}>
              <Stars count={r.rating} size={11} />
              <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: "5px 0 2px", lineHeight: 1.5 }}>"{r.comment}"</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, margin: 0 }}>— {r.author}</p>
            </div>
          ))}
        </div>
      </div>

      <BookingPanel product={product} onConfirm={onConfirm} />
    </div>
  );
}
