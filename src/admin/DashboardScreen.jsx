// ---------------------------------------------------------------------------
// LabShare — Admin Dashboard
//
// Aggregates the inventory picture for the team: 4 stat cards, three charts
// (per-category pie, per-status donut, revenue-by-month bar), a product table
// with search + filter, an inventory summary + total value strip, and two tree
// views (overall inventory + Category < Location hierarchy).
// ---------------------------------------------------------------------------
import React, { useState, useEffect, useMemo } from "react";
import { Search, Check, Package, Tag, Boxes, Wallet, MapPin } from "../lib/icons";
import {
  T, F, money, moneyShort,
  Card, PageHeader, fieldStyle, api,
} from "../lib/shared";
import ChartPanel from "./ChartPanel";

const STATUS_META = {
  available: { label: "Có sẵn", bg: T.greenBg, fg: T.green },
  sold: { label: "Đã bán", bg: T.dangerBg, fg: T.danger },
  reserve: { label: "Đặt giữ", bg: T.accentBg, fg: T.accentDeep },
  returning: { label: "Đang trả", bg: T.purpleBg, fg: T.purple },
};

function StatusBadge({ status }) {
  const s = STATUS_META[status] || { label: status, bg: T.bg, fg: T.inkSoft };
  return (
    <span style={{ background: s.bg, color: s.fg, fontFamily: F.display, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

// Small badge shown on a card once its value is loaded (i.e. "configured").
function ConfiguredBadge({ ready }) {
  if (!ready) return null;
  return (
    <span style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: "50%", background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.teal}` }}>
      <Check size={11} color={T.teal} strokeWidth={2.6} />
    </span>
  );
}

function StatCard({ label, value, ready, icon: Icon, color }) {
  return (
    <Card style={{ padding: 18, position: "relative" }}>
      <ConfiguredBadge ready={ready} />
      <Icon size={18} color={color} />
      <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.ink, margin: "10px 0 0" }}>{value}</p>
      <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "2px 0 0" }}>{label}</p>
    </Card>
  );
}

function TreeNode({ depth, children }) {
  return (
    <div style={{ marginLeft: depth * 16 }}>
      {children}
    </div>
  );
}

function TreePage({ title, tree }) {
  return (
    <Card style={{ padding: 18 }}>
      <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tree.length === 0 && <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>Chưa có dữ liệu.</p>}
        {tree.map((cat) => (
          <div key={cat.category} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 10px", background: T.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{cat.emoji}</span>
              <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 12.5, color: T.ink, flex: 1 }}>{cat.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: T.teal }}>{cat.quantity}</span>
              <span style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint }}>sp</span>
            </div>
            {cat.locations && (
              <TreeNode depth={1}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {cat.locations.map((loc) => (
                    <div key={loc.name} style={{ paddingLeft: 6, borderLeft: `2px solid ${T.line}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 4px" }}>
                        <MapPin size={11} color={T.inkFaint} />
                        <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkSoft, flex: 1 }}>{loc.name}</span>
                        <span style={{ fontFamily: F.mono, fontSize: 11, color: T.ink }}>{loc.quantity}</span>
                      </div>
                      {loc.products && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 14 }}>
                          {loc.products.map((pr) => (
                            <div key={pr.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px" }}>
                              <span style={{ fontSize: 9 }}>▸</span>
                              <span style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, flex: 1 }}>{pr.name}</span>
                              <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.inkSoft }}>x{pr.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TreeNode>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardScreen() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let active = true;
    api("/admin/inventory").then((j) => active && setData(j)).catch(() => {});
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.sealCode.toLowerCase().includes(query.toLowerCase())) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [data, query, statusFilter]);

  const ready = !!data;
  const t = data?.totals;

  const byStatusArr = data ? Object.entries(data.byStatus).map(([k, v]) => ({ label: STATUS_META[k]?.label || k, value: v })) : [];
  const byCategoryArr = data ? data.byCategory.map((c) => ({ label: c.label, value: c.quantity, emoji: c.emoji })) : [];
  const revenueArr = data?.revenueByMonth || [];

  // Overall inventory tree (category → qty sum).
  const inventoryTree = data
    ? data.byCategory.map((c) => ({ ...c, locations: null }))
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Tổng quan kho: sản phẩm hiện có, đã bán, còn lại và doanh thu." />

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Tổng sản phẩm" value={ready ? t.totalProducts : "…"} ready={ready} icon={Package} color={T.accentDeep} />
        <StatCard label="Sản phẩm đã bán" value={ready ? t.productsSold : "…"} ready={ready} icon={Tag} color={T.danger} />
        <StatCard label="Sản phẩm còn lại" value={ready ? t.productsRemaining : "…"} ready={ready} icon={Boxes} color={T.teal} />
        <StatCard label="Tổng doanh thu" value={ready ? money(t.totalRevenue) : "…"} ready={ready} icon={Wallet} color={T.green} />
      </div>

      {/* Inventory summary + total value */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 20 }}>
        <Card style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: 0 }}>Tổng số sp trong kho (qty)</p>
            <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.teal, margin: "2px 0 0" }}>{ready ? t.inventoryQty : "…"}</p>
          </div>
          <Boxes size={22} color={T.teal} />
        </Card>
        <Card style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: 0 }}>Tổng giá trị</p>
            <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.accentDeep, margin: "2px 0 0" }}>{ready ? money(t.totalValue) : "…"}</p>
          </div>
          <Wallet size={22} color={T.accentDeep} />
        </Card>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 18 }}>
          <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Phân bố kho theo danh mục</p>
          {ready ? <ChartPanel type="pie" data={byCategoryArr} format={(v) => `${v} sp`} /> : <ChartSkeleton />}
        </Card>
        <Card style={{ padding: 18 }}>
          <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Trạng thái sản phẩm</p>
          {ready ? <ChartPanel type="donut" data={byStatusArr} format={(v) => `${v} sp`} /> : <ChartSkeleton />}
        </Card>
        <Card style={{ padding: 18, gridColumn: "1 / -1" }}>
          <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Doanh thu theo tháng</p>
          {ready ? <ChartPanel type="bar" data={revenueArr} format={moneyShort} /> : <ChartSkeleton />}
        </Card>
      </div>

      {/* Product table + search/filter */}
      <Card style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: T.ink, margin: 0 }}>Danh sách sản phẩm</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.bg, border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 12px", minWidth: 220 }}>
              <Search size={14} color={T.inkFaint} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tên / mã niêm phong…"
                style={{ border: "none", outline: "none", flex: 1, fontFamily: F.body, fontSize: 12.5, background: "transparent", color: T.ink }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...fieldStyle, width: "auto", marginTop: 0, padding: "8px 12px" }}>
              <option value="">Mọi trạng thái</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                  {["Sản phẩm", "Danh mục", "Giá mới", "SL", "Trạng thái", "Vị trí", "Mã"].map((h) => (
                    <th key={h} style={{ fontFamily: F.body, fontSize: 11, color: T.inkFaint, fontWeight: 600, textAlign: "left", padding: "8px 10px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: 18, textAlign: "center", fontFamily: F.body, fontSize: 12.5, color: T.inkFaint }}>Không tìm thấy sản phẩm phù hợp.</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.line}` }}>
                    <td style={{ padding: "10px", fontFamily: F.body, fontSize: 12.5, color: T.ink, fontWeight: 500 }}>{p.emoji} {p.name}</td>
                    <td style={{ padding: "10px", fontFamily: F.body, fontSize: 12, color: T.inkSoft }}>{p.categoryLabel}</td>
                    <td style={{ padding: "10px", fontFamily: F.mono, fontSize: 12, color: T.accentDeep }}>{money(p.priceNew)}</td>
                    <td style={{ padding: "10px", fontFamily: F.mono, fontSize: 12, color: T.ink }}>{p.quantity}</td>
                    <td style={{ padding: "10px" }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: "10px", fontFamily: F.body, fontSize: 11.5, color: T.inkSoft }}>{p.location || "—"}</td>
                    <td style={{ padding: "10px", fontFamily: F.mono, fontSize: 11, color: T.inkFaint }}>{p.sealCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tree + Location views */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        <TreePage title="Cây kho (theo danh mục)" tree={inventoryTree} />
        <TreePage title="Vị trí (danh mục < vị trí)" tree={data?.locationTree || []} />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ height: 160, borderRadius: 10, background: "linear-gradient(90deg,#Eef1f6 25%,#f7f9fb 50%,#eef1f6 75%)", backgroundSize: "200% 100%" }} />
  );
}
function TableSkeleton() {
  return <div style={{ height: 120, borderRadius: 10, background: "linear-gradient(90deg,#Eef1f6 25%,#f7f9fb 50%,#eef1f6 75%)", backgroundSize: "200% 100%" }} />;
}
