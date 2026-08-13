import { T, F } from "../../theme/tokens";
import { trustScore } from "../../utils/productMetrics";
import { Check, ShieldCheck } from "lucide-react";

// Owner credibility summary with a computed trust score.
export default function TrustPanel({ owner }) {
  const score = trustScore(owner);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.accentDeep }}>
            {owner.name.split(" ").slice(-1)[0][0]}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <p style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 600, color: T.ink, margin: 0 }}>{owner.name}</p>
              {owner.verified && <ShieldCheck size={13} color={T.teal} />}
            </div>
            <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, margin: "2px 0 0" }}>Tham gia {owner.memberSince} · Phản hồi {owner.responseTime}</p>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: T.teal, margin: 0 }}>{score}</p>
          <p style={{ fontFamily: F.body, fontSize: 9.5, color: T.inkFaint, margin: 0 }}>Điểm tin cậy</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        {[
          owner.verified ? "Đã xác minh danh tính" : null,
          `${owner.rentalsCount} lượt cho thuê thành công`,
          `${owner.responseRate}% tỉ lệ phản hồi`,
          "0 khiếu nại",
        ].filter(Boolean).map((line, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11.5, color: T.inkSoft }}>
            <Check size={12} color={T.teal} /> {line}
          </span>
        ))}
      </div>
    </div>
  );
}
