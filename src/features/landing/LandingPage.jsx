import { T, F } from "../../theme/tokens";
import { CATS } from "../../data/categories";
import { money } from "../../utils/format";
import { PRODUCTS } from "../../data/products";
import {
  Search, ShieldCheck, BadgePercent, Timer, ArrowRight, Star, MapPin,
  Scale, Check, Sparkles, Wallet, Package, QrCode,
} from "lucide-react";

// --- KPI tiles ---------------------------------------------------------------
// Hero numbers + stat tiles. Colors follow brand tokens; value is the figure,
// label names it, delta (when present) carries movement.

const KPIS = [
  { icon: BadgePercent, value: "98%", label: "Tiết kiệm tới khi thuê thay vì mua", delta: "+21%", accent: T.accent },
  { icon: Package, value: "2.400+", label: "Thiết bị cho thuê sẵn sàng", delta: "+180/Tuần", accent: T.teal },
  { icon: Star, value: "4.9", label: "Đánh giá trung bình từ người thuê", delta: "★★★★★", accent: T.green },
  { icon: Timer, value: "30'", label: "Phản hồi trung bình từ chủ đồ", delta: "< 60'", accent: T.accentDeep },
];

function KpiTile({ icon: Icon, value, label, delta, accent }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <Icon size={20} color={accent} strokeWidth={2} />
      <span style={{ fontFamily: F.display, fontSize: 40, fontWeight: 700, color: T.ink, lineHeight: 1, letterSpacing: -0.5 }}>{value}</span>
      <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}>{label}</span>
      {delta && <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 600, color: T.green }}>{delta}</span>}
    </div>
  );
}

// --- Hero right-side: featured product mock card -----------------------------

const FEATURED = PRODUCTS.find((p) => p.id === "p2"); // MacBook Air M2

function HeroProductCard() {
  const badges = [
    { icon: ShieldCheck, text: "Chủ đã xác minh", color: T.teal },
    { icon: BadgePercent, text: `Tiết kiệm ~${Math.round((1 - FEATURED.price * 5 / FEATURED.buyPrice) * 100)}%`, color: T.accentDeep },
  ];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 22, boxShadow: "0 24px 60px rgba(32,26,21,0.20)", width: "100%", maxWidth: 360 }}>
      <div style={{ height: 150, borderRadius: 14, background: `linear-gradient(135deg, ${T.accentBg}, ${T.tealBg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 14 }}>
        {FEATURED.emoji}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: T.ink, margin: 0 }}>{FEATURED.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Star size={13} fill={T.accent} color={T.accent} />
          <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>{FEATURED.rating}</span>
        </div>
      </div>
      <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 5 }}>
        <MapPin size={13} /> {FEATURED.location} · cách bạn {FEATURED.distance}
      </p>
      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
        {badges.map((b, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F.body, fontSize: 11, color: b.color, background: T.bg, padding: "5px 9px", borderRadius: 20 }}>
            <b.icon size={12} strokeWidth={2.2} /> {b.text}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 14 }}>
        <span style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 700, color: T.ink }}>{money(FEATURED.price)}</span>
        <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>/ ngày</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="#categories" style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: T.accent, color: T.accentDeep, textAlign: "center", fontFamily: F.display, fontWeight: 600, fontSize: 13.5, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>Thuê ngay <ArrowRight size={15} /></a>
        <a href="#how" style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.line}`, color: T.ink, fontFamily: F.body, fontWeight: 500, fontSize: 13.5, textDecoration: "none", display: "flex", alignItems: "center" }}><Scale size={15} /></a>
      </div>
    </div>
  );
}

// --- Sections -----------------------------------------------------------------

const STEPS = [
  { n: "01", icon: Search, title: "Tìm thiết bị gần bạn", desc: "Khoan mua. Tìm laptop, máy ảnh, máy chiếu quanh khu bạn ở với bộ lọc giá, khoảng cách và danh mục." },
  { n: "02", icon: Check, title: "Thuê theo ngày", desc: "Chọn ngày trên lịch trực tiếp, thanh toán minh bạch — giá theo ngày, tiền cọc hoàn lại ngay khi trả." },
  { n: "03", icon: ShieldCheck, title: "Nhận đồ có kiểm tra", desc: "Quét mã QR khi nhận, checklist tình trạng từng phụ kiện rõ ràng, an tâm suốt thời gian sử dụng." },
  { n: "04", icon: Star, title: "Trả đồ đúng hẹn", desc: "Chấm điểm chủ đồ, xác nhận trả nhanh, tiền cọc về trong ngày. Lặp lại khi cần tiếp." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Điểm tin cậy rõ ràng", desc: "Chủ đồ được xác minh danh tính, điểm tin cậy theo lượt cho thuê và tỉ lệ phản hồi thực tế.", color: T.teal },
  { icon: Wallet, title: "Tiết kiệm tới 98%", desc: "Mua mới 26 triệu, thuê 90 nghìn/ngày. Chỉ trả cho đúng thời gian bạn thực sự cần.", color: T.accentDeep },
  { icon: QrCode, title: "Bàn giao an toàn", desc: "Quét mã QR khi nhận & trả, checklist tình trạng thiết bị và phụ kiện — không tranh cãi khi kết thúc.", color: T.green },
];

// --- Component ----------------------------------------------------------------

export default function LandingPage({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: F.body, color: T.ink }}>
      {/* ---------- Nav ---------- */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(247,242,234,0.86)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏷️</div>
            <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Thuê Đồ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <a href="#how" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Cách hoạt động</a>
            <a href="#categories" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Danh mục</a>
            <a href="#value" style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, textDecoration: "none" }}>Vì sao chúng tôi</a>
            <button onClick={onEnter} style={{ padding: "11px 20px", borderRadius: 12, background: T.accent, color: T.accentDeep, border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>
              Vào ứng dụng <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <header style={{ background: "radial-gradient(700px 420px at 78% -10%, rgba(200,80,46,0.10), transparent 60%), radial-gradient(600px 380px at 12% 110%, rgba(31,95,74,0.12), transparent 60%), #F7F2EA", color: T.ink, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "72px 24px 80px", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, padding: "7px 14px", borderRadius: 30, marginBottom: 22 }}>
              <Sparkles size={14} color={T.accent} />
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}>Marketplace cho thuê thiết bị công nghệ giữa sinh viên</span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(40px, 6vw, 60px)", fontWeight: 700, lineHeight: 1.05, margin: "0 0 20px", letterSpacing: -1 }}>
              Đừng mua.<br />
              <span style={{ color: T.accent }}>Thuê thôi.</span>
            </h1>
            <p style={{ fontFamily: F.body, fontSize: 17, color: T.inkSoft, maxWidth: 480, margin: "0 0 28px", lineHeight: 1.6 }}>
              Laptop, máy ảnh, máy chiếu từ sinh viên khác quanh bạn — giá theo ngày, minh bạch và được bảo vệ bởi điểm tin cậy.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={onEnter} style={{ padding: "15px 26px", borderRadius: 14, background: T.accent, color: T.accentDeep, border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", gap: 9 }}>
                Khám phá thiết bị <ArrowRight size={17} strokeWidth={2.5} />
              </button>
              <a href="#how" style={{ padding: "14px 24px", borderRadius: 14, border: `1px solid ${T.line}`, color: T.ink, fontFamily: F.body, fontWeight: 500, fontSize: 14.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                Xem cách hoạt động
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 30 }}>
              <div style={{ display: "flex" }}>
                {[T.accent, T.green, T.teal].map((c, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${T.bg}`, background: c, marginLeft: i ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{["💻", "📷", "🎙️"][i]}</div>
                ))}
              </div>
              <span style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft }}>Được tin dùng bởi <strong style={{ color: T.ink }}>5.000+</strong> sinh viên Hà Nội</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HeroProductCard />
          </div>
        </div>
      </header>

      {/* ---------- KPI strip ---------- */}
      <section style={{ maxWidth: 1120, margin: "-42px auto 0", padding: "0 24px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {KPIS.map((k) => <KpiTile key={k.label} {...k} />)}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" style={{ maxWidth: 1080, margin: "0 auto", padding: "90px 24px 0" }}>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 44px" }}>
          <p style={{ fontFamily: F.mono, fontSize: 12, color: T.accentDeep, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Cách hoạt động</p>
          <h2 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, margin: "0 0 12px", letterSpacing: -0.5 }}>Từ lúc cần đến lúc trả — trong 4 bước</h2>
          <p style={{ fontFamily: F.body, fontSize: 15, color: T.inkSoft, margin: 0 }}>Mỗi bước đều được thiết kế để minh bạch, nhanh và không lo về phí ẩn.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: 26, position: "relative" }}>
              <span style={{ position: "absolute", top: 20, right: 20, fontFamily: F.display, fontSize: 30, fontWeight: 700, color: T.line }}>{s.n}</span>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <s.icon size={22} color={T.accentDeep} />
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{s.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section id="categories" style={{ maxWidth: 1080, margin: "0 auto", padding: "90px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: F.mono, fontSize: 12, color: T.accentDeep, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Danh mục</p>
            <h2 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 700, margin: 0 }}>Thuê gì hôm nay?</h2>
          </div>
          <button onClick={onEnter} style={{ padding: "11px 18px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>
            Xem tất cả <ArrowRight size={15} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {CATS.map((c) => (
            <button key={c.id} onClick={onEnter} style={{
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: "26px 14px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "transform .15s, border-color .15s",
            }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = T.ink; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.line; }}
            >
              <span style={{ fontSize: 44 }}>{c.emoji}</span>
              <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.ink }}>{c.label}</span>
              <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkFaint }}>Từ 40.000đ/ngày</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section id="value" style={{ maxWidth: 1080, margin: "0 auto", padding: "90px 24px 0" }}>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 40px" }}>
          <p style={{ fontFamily: F.mono, fontSize: 12, color: T.accentDeep, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Vì sao Thuê Đồ</p>
          <h2 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 700, margin: 0 }}>Thuê thông minh hơn mua mới</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <v.icon size={24} color={v.color} strokeWidth={2} />
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{v.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "90px 24px" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 24, padding: "60px 40px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 18px 44px rgba(32,26,21,0.06)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(600px 300px at 50% 0%, rgba(200,80,46,0.08), transparent 65%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 36, margin: "0 0 12px" }}>📦</p>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: T.ink, margin: "0 0 12px", letterSpacing: -0.5 }}>
              Có thiết bị đang nằm không? Hãy cho thuê.
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 15, color: T.inkSoft, maxWidth: 480, margin: "0 auto 26px", lineHeight: 1.6 }}>
              Biến đồ dùng thừa thành thu nhập. Đăng tin miễn phí, quản lý yêu cầu ngay trong ứng dụng.
            </p>
            <button onClick={onEnter} style={{ padding: "16px 30px", borderRadius: 14, background: T.accent, color: T.accentDeep, border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: 15.5, display: "inline-flex", alignItems: "center", gap: 9 }}>
              Bắt đầu ngay <ArrowRight size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏷️</div>
            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: T.ink }}>Thuê Đồ</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Về chúng tôi", "Điều khoản", "Bảo mật", "Trợ giúp"].map((l) => (
              <span key={l} style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, cursor: "pointer" }}>{l}</span>
            ))}
          </div>
          <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint }}>© 2026 Thuê Đồ · Dành cho sinh viên</span>
        </div>
      </footer>
    </div>
  );
}
