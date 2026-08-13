import { T, F } from "../../theme/tokens";

const STATUS_MAP = {
  pending: { bg: T.accentBg, fg: T.accentDeep, label: "Chờ xác nhận" },
  confirmed: { bg: T.tealBg, fg: T.tealDeep, label: "Đã xác nhận" },
  picked_up: { bg: T.tealBg, fg: T.tealDeep, label: "Đang sử dụng" },
  completed: { bg: "#EDEFF3", fg: T.inkSoft, label: "Hoàn tất" },
  rejected: { bg: T.dangerBg, fg: T.danger, label: "Đã từ chối" },
  available: { bg: T.tealBg, fg: T.tealDeep, label: "Đang cho thuê" },
};

// Pill that renders a booking / listing status with its palette + label.
export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{
      background: s.bg, color: s.fg, fontFamily: F.display, fontSize: 10.5, fontWeight: 600,
      letterSpacing: 0.3, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
}
