import { T, F } from "../../theme/tokens";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const CAL_YEAR = 2026;
const CAL_MONTH = 7; // August (0-indexed)

// Month grid for date picking; blocks days in `product.unavailableDays`.
export default function AvailabilityCalendar({ product, start, end, onPick }) {
  const firstDay = new Date(CAL_YEAR, CAL_MONTH, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(CAL_YEAR, CAL_MONTH + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const dateStr = (d) => `${CAL_YEAR}-08-${String(d).padStart(2, "0")}`;
  const startDay = start ? Number(start.split("-")[2]) : null;
  const endDay = end ? Number(end.split("-")[2]) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: F.display, fontSize: 12.5, fontWeight: 600, color: T.ink }}>Tháng 8, 2026</span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: T.tealBg, border: `1px solid ${T.teal}` }} /> Trống
          </span>
          <span style={{ fontFamily: F.body, fontSize: 10, color: T.inkFaint, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: T.dangerBg }} /> Đã thuê
          </span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {WEEKDAYS.map((w) => (
          <span key={w} style={{ fontFamily: F.body, fontSize: 9.5, color: T.inkFaint, textAlign: "center" }}>{w}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const unavailable = product.unavailableDays.includes(d);
          const inRange = startDay && endDay && d >= startDay && d <= endDay;
          const isEdge = d === startDay || d === endDay;
          return (
            <button
              key={i}
              disabled={unavailable}
              onClick={() => onPick(dateStr(d))}
              style={{
                aspectRatio: "1", borderRadius: 7, border: "none", cursor: unavailable ? "not-allowed" : "pointer",
                background: unavailable ? T.dangerBg : isEdge ? T.ink : inRange ? T.tealBg : T.bg,
                color: unavailable ? T.danger : isEdge ? "#fff" : T.ink,
                fontFamily: F.mono, fontSize: 10.5, fontWeight: isEdge ? 700 : 400,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
