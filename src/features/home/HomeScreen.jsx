import { T, F } from "../../theme/tokens";
import { CATS } from "../../data/categories";
import { money } from "../../utils/format";
import ProductGridCard from "../../components/product/ProductGridCard";
import { Search } from "lucide-react";

// Browse + filter screen: search, price cap, and category chips over the catalog.
export default function HomeScreen({ products, onOpen, query, setQuery, catFilter, setCatFilter, maxPrice, setMaxPrice, compareIds, onToggleCompare }) {
  return (
    <div>
      <div style={{
        background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: "34px 32px", marginBottom: 22,
        display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 14px 36px rgba(32,26,21,0.05)",
      }}>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.25 }}>
          Cần dùng vài ngày?<br />Đừng mua — thuê thôi.
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, margin: "8px 0 0", maxWidth: 480 }}>
          Thuê đồ từ người khác quanh bạn — giá theo ngày, tiết kiệm tới 98% so với mua mới.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{
          flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, background: T.surface,
          border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 14px",
        }}>
          <Search size={16} color={T.inkFaint} />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm đồ bạn cần..."
            style={{ border: "none", outline: "none", flex: 1, fontFamily: F.body, fontSize: 13.5, background: "transparent", color: T.ink }}
          />
        </div>
        <div style={{
          flex: "0 0 220px", display: "flex", alignItems: "center", gap: 10, background: T.surface,
          border: `1px solid ${T.line}`, borderRadius: 12, padding: "0 14px",
        }}>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint, whiteSpace: "nowrap" }}>≤ {money(maxPrice)}</span>
          <input type="range" min={30000} max={160000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ flex: 1 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {CATS.map((c) => {
          const isActive = catFilter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCatFilter(isActive ? null : c.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 20,
                border: `1px solid ${isActive ? T.ink : T.line}`, background: isActive ? T.ink : T.surface, cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13 }}>{c.emoji}</span>
              <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 500, color: isActive ? "#fff" : T.inkSoft }}>{c.label}</span>
            </button>
          );
        })}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "0 0 12px" }}>{products.length} thiết bị phù hợp</p>

      {products.length === 0 ? (
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkFaint, textAlign: "center", marginTop: 40 }}>
          Không tìm thấy thiết bị phù hợp. Thử đổi bộ lọc.
        </p>
      ) : (
        <div className="rm-grid">
          {products.map((p) => (
            <ProductGridCard key={p.id} p={p} onClick={() => onOpen(p)} compareChecked={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />
          ))}
        </div>
      )}
    </div>
  );
}
