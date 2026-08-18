import { useState, useEffect } from "react";
import { T, F } from "../../theme/tokens";
import { money } from "../../utils/format";
import heroBg from "../../assets/hero-bg1.jpg";
import {
  Search, ShieldCheck, Timer, ArrowRight, MapPin,
  Check, Sparkles, Wallet, Boxes, Microscope, Cpu, CircuitBoard,
  GraduationCap, BadgeCheck, PackageCheck,
} from "../../lib/icons";

// =====================================================================
// LabShare — landing page (MVP).
//
// Job: turn a student who *has a project* into someone who *leaves a
// rental need / registers interest*. Everything funnels to validation
// (describe project → pick kit → register to rent → willing to deposit)
// rather than to a big catalog. Forms collect into local state only for
// now; a backend can subscribe later.
// =====================================================================

// --- Featured kits (by need, not by model number) ----------------------
// Replaced by a live fetch of the real product catalog (section ④). KITS was
// mock bundles with emoji icons; per user direction we now show real devices
// with real photos — falling back to an empty image slot, never an icon.

// --- Suggested kit (the "AI" result, shown after describing a project) --

const SUGGESTED = [
  { name: "STM32 Development Kit", icon: Cpu, price: 20000 },
  { name: "Oscilloscope", icon: Microscope, price: 40000 },
  { name: "DC Power Supply", icon: PackageCheck, price: 25000 },
];

// --- How it works ------------------------------------------------------

const STEPS = [
  { n: "①", icon: GraduationCap, title: "Mô tả project", desc: "Kể chúng tôi nghe bạn đang làm gì — không cần biết tên thiết bị." },
  { n: "②", icon: CircuitBoard, title: "Chọn kit", desc: "Nhận gợi ý bộ thiết bị phù hợp, chọn đúng thứ mình cần." },
  { n: "③", icon: MapPin, title: "Nhận tại điểm gần trường", desc: "Nhận thiết bị đã được kiểm tra, niêm phong tại điểm nhận/trả." },
  { n: "④", icon: Check, title: "Làm xong → trả → nhận cọc", desc: "Trả đúng hẹn, checklist tình trạng rõ ràng, tiền cọc về ngay." },
];

// --- Trust checklist ---------------------------------------------------

const TRUST = [
  "Kiểm tra tình trạng trước khi cho thuê",
  "Phân hạng thiết bị A/B",
  "Video test trước khi bàn giao",
  "Niêm phong thiết bị",
  "Đặt cọc rõ ràng",
  "Điểm nhận/trả xác định",
];

// --- Final validation form options -------------------------------------

const SCHOOLS = ["HUST", "NEU", "UET", "PTIT", "Khác"];
const MAJORS = ["Điện - Điện tử", "Cơ khí", "CNTT", "Tự động hóa", "Khác"];
const EQUIP_NEED = ["Tôi chưa biết", "STM32 / MCU", "Oscilloscope", "Power Supply", "IoT / ESP32", "Khác"];
const DURATIONS = ["1–3 ngày", "1 tuần", "2–4 tuần", "> 1 tháng"];
const BUDGETS = ["< 50k/ngày", "50–100k/ngày", "100–200k/ngày", "> 200k/ngày"];

// --- Shared bits -------------------------------------------------------

const Section = ({ kicker, title, sub, children, id, max = 1080, center = true }) => (
  <section id={id} style={{ maxWidth: max, margin: "0 auto", padding: "84px 24px 0" }}>
    <div style={{ textAlign: center ? "center" : "left", maxWidth: 560, margin: center ? "0 auto 40px" : "0 0 32px" }}>
      {kicker && <p style={{ fontFamily: F.mono, fontSize: 12, color: T.tealDeep, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>{kicker}</p>}
      <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.4vw, 34px)", fontWeight: 700, color: T.ink, margin: "0 0 12px", letterSpacing: -0.5 }}>{title}</h2>
      {sub && <p style={{ fontFamily: F.body, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
    {children}
  </section>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: 24, ...style }}>{children}</div>
);

const Chip = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, border: `1px solid ${T.line}`, padding: "7px 13px", borderRadius: 24, fontFamily: F.mono, fontSize: 11.5, color: T.inkSoft }}>{children}</span>
);

// Primary CTA button (solid terracotta) and Ghost (outline).
const Primary = ({ children, onClick, big, type }) => (
  <button type={type} onClick={onClick} style={{ padding: big ? "15px 26px" : "12px 20px", borderRadius: 14, background: T.teal, color: "#fff", border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: big ? 15.5 : 14, display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</button>
);

const Ghost = ({ children, onClick, type }) => (
  <button type={type} onClick={onClick} style={{ padding: "12px 20px", borderRadius: 14, border: `1px solid ${T.line}`, background: "transparent", color: T.ink, cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</button>
);

// Full-width decorative stripe band spanning the whole screen (single color),
// used as a colorful divider between the white content sections.
const StripeBand = ({ color = T.teal, height = 44, reverse = false, style = {} }) => (
  <div aria-hidden style={{ width: "100%", height, background: `repeating-linear-gradient(${reverse ? "-45deg" : "135deg"}, ${color} 0 26px, #FFFFFF 26px 52px)`, opacity: 0.85, ...style }} />
);

// Small shared styled <select> + <input> + <textarea>.
const fieldBase = {
  width: "100%", background: T.bg, border: `1px solid ${T.line}`, borderRadius: 12,
  padding: "12px 14px", fontFamily: F.body, fontSize: 14, color: T.ink, outline: "none",
};
const FieldSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} style={{ ...fieldBase, appearance: "auto", cursor: "pointer" }}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const RadioGroup = ({ legend, value, onChange, options }) => (
  <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
    <legend style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, marginBottom: 10 }}>{legend}</legend>
    <div className="lp-radio2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)} style={{
            padding: "11px 12px", borderRadius: 11, cursor: "pointer", fontFamily: F.body, fontSize: 13,
            fontWeight: 600, color: on ? "#fff" : T.inkSoft, background: on ? T.teal : T.bg,
            border: `1px solid ${on ? T.teal : T.line}`, textAlign: "left",
          }}>
            {on ? "● " : "○ "}{o}
          </button>
        );
      })}
    </div>
  </fieldset>
);

// =====================================================================
// Component
// =====================================================================

export default function LandingPage({ onEnter }) {
  // Real product catalog — fetched from the app API so the "popular devices"
  // section shows genuine items with real photos, not mock kits.
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("catalog fetch failed")))
      .then(({ products }) => { if (alive && Array.isArray(products)) setProducts(products); })
      .catch(() => { /* leave empty — section just renders no cards */ });
    return () => { alive = false; };
  }, []);

  // AI suggest section state
  const [desc, setDesc] = useState("");
  const [suggested, setSuggested] = useState(false);

  // Final validation form state
  const [form, setForm] = useState({ school: "HUST", major: "Điện - Điện tử", project: "", equip: "Tôi chưa biết", duration: "", budget: "" });
  const [registered, setRegistered] = useState(false);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSuggest = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setSuggested(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // MVP: collect locally — log so a backend can subscribe later.
    console.log("LabShare nhu cầu thuê:", form);
    setRegistered(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === "object" ? e.target.value : e }));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: F.body, color: T.ink }}>
      {/* ---------- Nav ---------- */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(238,241,246,0.86)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircuitBoard size={17} color={T.tealDeep} />
            </div>
            <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: T.ink }}>LabShare</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#kits" onClick={() => scrollTo("kits")} className="lp-navlink" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Thiết bị</a>
            <a href="#how" onClick={() => scrollTo("how")} className="lp-navlink" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Cách hoạt động</a>
            <a href="#register" onClick={() => scrollTo("register")} className="lp-navlink" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Đăng ký</a>
            <button onClick={onEnter} style={{ padding: "10px 18px", borderRadius: 12, background: T.teal, color: "#fff", border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
              Vào ứng dụng <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- ① Hero ---------- */}
      <header style={{ background: "radial-gradient(700px 420px at 80% -10%, rgba(42,111,104,0.14), transparent 60%), radial-gradient(600px 380px at 10% 110%, rgba(42,111,104,0.14), transparent %), #EEF1F6", color: T.ink, position: "relative", overflow: "hidden" }}>
        <img src={heroBg} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(238,241,246,0.90) 0%, rgba(238,241,246,0.86) 50%, rgba(238,241,246,0.94) 100%)" }} />
        <div className="lp-hero" style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "76px 24px 84px", display: "grid", gridTemplateColumns: "1fr", gap: 40, alignItems: "start" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surface, border: `1px solid ${T.line}`, padding: "7px 14px", borderRadius: 30, marginBottom: 22 }}>
              <MapPin size={13} color={T.teal} />
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Hiện thử nghiệm tại <strong style={{ color: T.ink }}>HUST</strong></span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px, 8vw, 58px)", fontWeight: 700, lineHeight: 1.06, margin: "0 0 16px", letterSpacing: -1 }}>
              Không cần mua thiết bị chỉ để làm một project.<br />
              <span style={{ color: T.teal }}>Thuê thiết bị STEM theo ngày/tuần.</span>
            </h1>
            <p style={{ fontFamily: F.body, fontSize: 17, color: T.inkSoft, maxWidth: 500, margin: "0 0 22px", lineHeight: 1.6 }}>
              Oscilloscope, Power Supply, Arduino, STM32, Raspberry Pi, Logic Analyzer — ngay tại trường, giá minh bạch và được kiểm tra trước khi nhận.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
              {["Oscilloscope", "Power Supply", "Arduino", "STM32", "Raspberry Pi", "Logic Analyzer"].map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Primary big onClick={() => scrollTo("kits")}>Tìm thiết bị <ArrowRight size={17} strokeWidth={2.5} /></Primary>
              <Ghost onClick={() => scrollTo("suggest")}>Tôi có project cần thiết bị <Sparkles size={15} color={T.teal} /></Ghost>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- ② Problem → Solution ---------- */}
      <Section kicker="Vấn đề" title="Bạn đang gặp vấn đề này?" sub="Đừng để việc thiếu thiết bị chặn project của bạn — có cách rẻ hơn nhiều.">
        <div className="lp-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { icon: Wallet, title: "Thiết bị đắt", desc: "Một project chỉ cần dùng vài tuần nhưng phải bỏ hàng triệu đồng để mua." },
            { icon: Timer, title: "Phụ thuộc phòng lab", desc: "Thiết bị có nhưng không phải lúc nào cũng dùng được, khó mang ra ngoài." },
            { icon: Search, title: "Không biết cần mua gì", desc: "Mới làm project, bạn thường không biết chính xác bộ thiết bị nào phù hợp." },
          ].map((p) => (
            <Card key={p.title}><p.icon size={22} color={T.tealDeep} /><h3 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, margin: "12px 0 8px" }}>{p.title}</h3><p style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, margin: 0 }}>{p.desc}</p></Card>
          ))}
        </div>

        <div style={{ textAlign: "center", margin: "30px 0 8px", color: T.inkFaint }}>↓</div>

        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: "34px 28px" }}>
          <p style={{ fontFamily: F.mono, fontSize: 12, color: T.teal, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 22px" }}>LabShare giải quyết bằng cách</p>
          <div className="lp-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: GraduationCap, t: "Chọn project" },
              { icon: CircuitBoard, t: "Nhận bộ thiết bị phù hợp" },
              { icon: Timer, t: "Thuê trong thời gian cần" },
              { icon: Check, t: "Trả lại" },
            ].map((s) => (
              <div key={s.t} style={{ textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <s.icon size={22} color={T.tealDeep} />
                </div>
                <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink, margin: 0, lineHeight: 1.4 }}>{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- ③ "Bạn đang làm project gì?" (AI suggest) ---------- */}
      <Section id="suggest" kicker="Gợi ý thiết bị" title="Bạn đang làm project gì?" sub="Mô tả bằng lời của bạn — LabShare đề xuất bộ thiết bị phù hợp. Không cần thuộc tên model.">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <form onSubmit={handleSuggest} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder={`Ví dụ: "Robot dùng STM32, cần đo PWM và dòng điện..."`}
              style={{ ...fieldBase, resize: "vertical", lineHeight: 1.6, fontSize: 15, borderRadius: 16 }}
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Primary big type="submit"><Sparkles size={17} /> Tìm thiết bị cho tôi</Primary>
            </div>
          </form>

          {suggested && (
            <div style={{ marginTop: 28, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Sparkles size={16} color={T.teal} />
                <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, margin: 0 }}>Bộ thiết bị đề xuất cho bạn</h3>
              </div>
              {SUGGESTED.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <s.icon size={16} color={T.tealDeep} />
                    </div>
                    <span style={{ fontFamily: F.body, fontSize: 14, color: T.ink }}>{s.name}</span>
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{money(s.price)}<span style={{ color: T.inkFaint, fontWeight: 400 }}>/ngày</span></span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderTop: `2px solid ${T.ink}` }}>
                <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: T.ink }}>Tổng</span>
                <span style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: T.teal }}>
                  ~{money(85000)}<span style={{ color: T.inkFaint, fontWeight: 400, fontSize: 13 }}>/ngày</span>
                </span>
              </div>
              <button onClick={onEnter} style={{ width: "100%", marginTop: 14, padding: "14px 0", borderRadius: 12, background: T.teal, color: "#fff", border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Đăng ký thuê bộ này <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* ---------- ④ Featured devices (real catalog) ---------- */}
      <Section id="kits" kicker="Thiết bị phổ biến" title="Các thiết bị phổ biến" sub="Chọn theo nhu cầu của project — không cần biết tên model.">
        {products.length > 0 && (
          <div className="lp-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {products.slice(0, 4).map((p) => (
              <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: 22 }}>
                <div style={{ height: 100, borderRadius: 14, background: T.bg, marginBottom: 14, overflow: "hidden" }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : null}
                </div>
                <h3 style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{p.name}</h3>
                <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{p.categoryLabel}</p>
                <p style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: T.teal, margin: 0 }}>{money(p.price)}<span style={{ color: T.inkFaint, fontWeight: 400, fontSize: 11 }}>/ngày</span></p>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Ghost onClick={onEnter}>Xem tất cả thiết bị <ArrowRight size={15} /></Ghost>
        </div>
      </Section>

      {/* ---------- ⑤ How it works ---------- */}
      <Section id="how" kicker="Cách hoạt động" title="Thuê hoạt động thế nào?" sub="Chỉ 4 bước — từ lúc cần đến lúc trả.">
        <div className="lp-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {STEPS.map((s) => (
            <Card key={s.n}>
              <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: T.teal }}>{s.n}</span>
              <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, margin: "8px 0 6px" }}>{s.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ---------- ⑥ Trust / Quality ---------- */}
      <Section id="trust" kicker="Chất lượng" title="🔒 Mỗi thiết bị đều được kiểm tra trước khi cho thuê" sub="Đây chính là điểm khác biệt so với 'đăng lên Facebook rồi cho mượn'.">
        <div className="lp-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {TRUST.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={15} color={T.green} strokeWidth={3} />
              </div>
              <span style={{ fontFamily: F.body, fontSize: 14, color: T.ink }}>{t}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- ⑦ Senior section ---------- */}
      <Section id="senior" kicker="Dành cho người có thiết bị" title="Bạn có thiết bị không còn sử dụng?" sub="Đừng để Arduino, STM32, Raspberry Pi, sensor kit... nằm trong tủ.">
        <div className="lp-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "center" }}>
          <Card style={{ borderLeft: `3px solid ${T.teal}` }}>
            <Boxes size={22} color={T.tealDeep} />
            <h3 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, margin: "12px 0 8px" }}>Cho thuê thiết bị → kiếm thêm thu nhập</h3>
            <p style={{ fontFamily: F.body, fontSize: 14, color: T.inkSoft, lineHeight: 1.65, margin: 0 }}>
              Thiết bị nằm im không sinh lời. Cho LabShare quản lý — chúng tôi lo kiểm tra, bàn giao và điểm nhận/trả cho bạn.
            </p>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: ShieldCheck, t: "LabShare hỗ trợ quản lý", d: "Kiểm tra, niêm phong, lịch cho thuê." },
              { icon: BadgeCheck, t: "Đặt cọc rõ ràng", d: "Bạn luôn được bảo vệ khi cho thuê." },
            ].map((s) => (
              <div key={s.t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <s.icon size={18} color={T.tealDeep} />
                </div>
                <div>
                  <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, margin: 0 }}>{s.t}</p>
                  <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, margin: "2px 0 0" }}>{s.d}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>
              <Primary onClick={onEnter}>Đăng ký ký gửi thiết bị <ArrowRight size={16} /></Primary>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- ⑧ Pickup points ---------- */}
      <Section id="pickup" kicker="Điểm nhận/trả" title="📍 Nhận thiết bị gần bạn" sub="Nhận và trả tại điểm cố định, đúng giờ, có kiểm tra.">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, margin: 0 }}>KTX Bách Khoa</h3>
                <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, margin: "4px 0 0" }}>Cơ sở đầu tiên của LabShare</p>
              </div>
              <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: T.green, background: T.greenBg, padding: "5px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} /> Đang hoạt động
              </span>
            </div>
            {[
              ["📦", "Điểm nhận", "Cổng A"],
              ["🕐", "Giờ hoạt động", "17:00 – 22:00"],
            ].map(([icon, k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: `1px solid ${T.line}` }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, flex: 1 }}>{k}</span>
                <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: T.ink }}>{v}</span>
              </div>
            ))}
          </Card>
          <p style={{ textAlign: "center", fontFamily: F.body, fontSize: 12.5, color: T.inkFaint, marginTop: 16 }}>
            Sắp mở rộng: <strong style={{ color: T.inkSoft }}>HUST → NEU → UET → PTIT...</strong>
          </p>
        </div>
      </Section>

      {/* ---------- ⑨ Final CTA + validation form ---------- */}
      <section id="register" style={{ maxWidth: 1080, margin: "0 auto", padding: "84px 24px" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 24, padding: "clamp(32px, 5vw, 56px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(600px 300px at 50% 0%, rgba(42,111,104,0.12), transparent 65%)" }} />
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 34, margin: "0 0 10px" }}>🚀</p>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, margin: "0 0 10px", letterSpacing: -0.5 }}>
              Bạn đang cần thiết bị cho project?
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 15, color: T.inkSoft, margin: "0 0 6px", lineHeight: 1.6 }}>
              Hãy cho chúng tôi biết bạn đang làm gì — chúng tôi sẽ tìm bộ thiết bị phù hợp cho bạn.
            </p>
          </div>

          {registered ? (
            <div style={{ position: "relative", maxWidth: 520, margin: "26px auto 0", textAlign: "center", background: T.greenBg, border: `1px solid ${T.green}`, borderRadius: 16, padding: "30px 24px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Check size={26} color="#fff" strokeWidth={3} />
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: T.ink, margin: 0 }}>Đã ghi nhận nhu cầu của bạn!</h3>
              <p style={{ fontFamily: F.body, fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.6 }}>
                LabShare sẽ liên hệ khi bộ thiết bị phù hợp sẵn sàng. Không cần mua — chỉ cần nói cho chúng tôi biết.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ position: "relative", maxWidth: 520, margin: "28px auto 0", display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="lp-form2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Bạn đang học trường nào?</label>
                  <FieldSelect value={form.school} onChange={set("school")} options={SCHOOLS} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Ngành?</label>
                  <FieldSelect value={form.major} onChange={set("major")} options={MAJORS} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Bạn đang làm project gì?</label>
                <textarea value={form.project} onChange={set("project")} rows={2} placeholder='Ví dụ: "Robot theo dõi, cần cảm biến và STM32..."' style={{ ...fieldBase, resize: "vertical", lineHeight: 1.6 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Bạn cần thiết bị nào?</label>
                <FieldSelect value={form.equip} onChange={set("equip")} options={EQUIP_NEED} />
              </div>

              <RadioGroup legend="Thời gian cần" value={form.duration} onChange={(v) => set("duration")(v)} options={DURATIONS} />
              <RadioGroup legend="Mức ngân sách" value={form.budget} onChange={(v) => set("budget")(v)} options={BUDGETS} />

              <button type="submit" style={{ marginTop: 6, padding: "15px 0", borderRadius: 14, background: T.teal, color: "#fff", border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Đăng ký <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "34px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircuitBoard size={15} color={T.tealDeep} />
            </div>
            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: T.ink }}>LabShare</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Thiết bị", "Cách hoạt động", "Điểm nhận/trả", "Điều khoản"].map((l) => (
              <a key={l} href={`#${l}`} style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, textDecoration: "none", cursor: "pointer" }}>{l}</a>
            ))}
          </div>
          <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>© 2026 LabShare · Hiện thử nghiệm tại HUST</span>
        </div>
      </footer>
    </div>
  );
}
