import React from "react";
import { T, F } from "../../theme/tokens";
import { money } from "../../utils/format";
import { trustScore, savingsFor } from "../../utils/productMetrics";
import Modal from "../../components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { Scale } from "lucide-react";

// Floating action bar at the bottom, shown once >= 2 items are selected.
export function CompareBar({ ids, onOpen, onClear }) {
  if (ids.length < 2) return null;
  return (
    <div style={{
      position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 30,
      background: T.surface, borderRadius: 14, padding: "10px 10px 10px 18px",
      display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 24px rgba(32,26,21,0.18)", border: `1px solid ${T.line}`,
    }}>
      <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink }}>{ids.length} sản phẩm đã chọn để so sánh</span>
      <button onClick={onClear} style={{ background: "none", border: "none", color: T.inkSoft, fontFamily: F.body, fontSize: 12, cursor: "pointer" }}>Xoá</button>
      <PrimaryButton onClick={onOpen} icon={Scale} style={{ width: "auto", padding: "9px 16px", background: T.accent, color: "#fff" }}>So sánh ngay</PrimaryButton>
    </div>
  );
}

const COMPARE_ROWS = [
  { label: "Giá / ngày", get: (p) => money(p.price) },
  { label: "Tình trạng", get: (p) => p.condition },
  { label: "Đánh giá", get: (p) => `${p.rating} (${p.reviewCount})` },
  { label: "Khoảng cách", get: (p) => p.distance },
  { label: "Điểm tin cậy chủ", get: (p) => `${trustScore(p.owner)}/100` },
  { label: "Tiết kiệm vs mua (5 ngày)", get: (p) => `~${savingsFor(p).pct}%` },
];

// Side-by-side comparison table in a modal.
export function CompareModal({ products, onClose, onOpenDetail }) {
  return (
    <Modal onClose={onClose} width={720}>
      <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>So sánh thiết bị</h2>
      <div className="rm-compare-grid" style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)` }}>
        <div />
        {products.map((p) => (
          <div key={p.id} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30 }}>{p.emoji}</div>
            <p style={{ fontFamily: F.display, fontSize: 12.5, fontWeight: 600, color: T.ink, margin: "6px 0 0" }}>{p.name}</p>
          </div>
        ))}
        {COMPARE_ROWS.map((row) => (
          <React.Fragment key={row.label}>
            <div style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, alignSelf: "center", paddingTop: 10, borderTop: `1px solid ${T.line}` }}>{row.label}</div>
            {products.map((p) => (
              <div key={p.id} style={{ fontFamily: F.mono, fontSize: 12.5, color: T.ink, textAlign: "center", paddingTop: 10, borderTop: `1px solid ${T.line}` }}>{row.get(p)}</div>
            ))}
          </React.Fragment>
        ))}
        <div />
        {products.map((p) => (
          <div key={p.id} style={{ paddingTop: 14 }}>
            <SecondaryButton onClick={() => onOpenDetail(p)} style={{ width: "100%" }}>Xem chi tiết</SecondaryButton>
          </div>
        ))}
      </div>
    </Modal>
  );
}
