import { useState } from "react";
import { T, F } from "../../theme/tokens";
import { CATS, catInfo, LOCATIONS, CONDITIONS } from "../../data/categories";
import Modal from "../../components/ui/Modal";
import { PrimaryButton } from "../../components/ui/Button";
import { Check } from "lucide-react";

const EMPTY_FORM = { name: "", category: "laptop", price: "", buyPrice: "", location: "Bách Khoa", condition: "Rất tốt", desc: "" };

// Form modal used by owners to publish a new rental listing.
export default function AddEquipmentModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const field = { width: "100%", padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.line}`, fontFamily: F.body, fontSize: 13, color: T.ink, background: T.bg, marginTop: 5, boxSizing: "border-box" };
  const label = { fontFamily: F.body, fontSize: 11.5, color: T.inkSoft, fontWeight: 500 };

  const submit = () => {
    if (!form.name.trim() || !form.price || Number(form.price) <= 0) {
      setError("Nhập tên món đồ và giá thuê hợp lệ.");
      return;
    }
    setError("");
    onSubmit({
      id: "n" + Date.now(), name: form.name.trim(), category: form.category, price: Number(form.price),
      buyPrice: Number(form.buyPrice) || Number(form.price) * 150,
      location: form.location, distance: "0 km", rating: 5.0, reviewCount: 0, condition: form.condition,
      deposit: Math.round(Number(form.price) * 6), lastInspected: "Hôm nay",
      conditionDetails: [{ label: "Tình trạng chung", value: form.condition }],
      included: [], notIncluded: [],
      owner: { name: "Bạn", rating: 5.0, verified: true, rentalsCount: 5, responseRate: 100, responseTime: "< 5 phút", memberSince: 2026 },
      availability: "Đang cho thuê", unavailableDays: [],
      desc: form.desc.trim() || "Chưa có mô tả chi tiết.",
      emoji: catInfo(form.category).emoji, reviews: [], mine: true,
    });
  };

  return (
    <Modal onClose={onClose} width={480}>
      <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>Đăng thiết bị cho thuê</h2>

      <label style={label}>Tên thiết bị</label>
      <input style={field} value={form.name} onChange={update("name")} placeholder="VD: MacBook Air M2" />

      <label style={{ ...label, display: "block", marginTop: 14 }}>Danh mục</label>
      <select style={field} value={form.category} onChange={update("category")}>
        {CATS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Giá / ngày (đ)</label>
          <input style={field} type="number" value={form.price} onChange={update("price")} placeholder="80000" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Giá mua mới (đ)</label>
          <input style={field} type="number" value={form.buyPrice} onChange={update("buyPrice")} placeholder="15000000" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Khu vực</label>
          <select style={field} value={form.location} onChange={update("location")}>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Tình trạng</label>
          <select style={field} value={form.condition} onChange={update("condition")}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <label style={{ ...label, display: "block", marginTop: 14 }}>Mô tả</label>
      <textarea style={{ ...field, minHeight: 68, resize: "vertical", fontFamily: F.body }} value={form.desc} onChange={update("desc")} placeholder="Tình trạng, phụ kiện đi kèm, lưu ý cho người thuê..." />

      {error && <p style={{ fontFamily: F.body, fontSize: 12, color: T.danger, marginTop: 10 }}>{error}</p>}

      <PrimaryButton style={{ marginTop: 18 }} onClick={submit} icon={Check}>Đăng tin</PrimaryButton>
    </Modal>
  );
}
