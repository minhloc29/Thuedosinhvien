import { T, F } from "../../theme/tokens";

// Small overlay badge (chevron-free) used for "best match" markers.
export default function MatchBadge({ badge }) {
  if (!badge) return null;
  return (
    <span style={{
      position: "absolute", top: 10, left: 10, background: badge.bg, color: badge.fg,
      fontFamily: F.display, fontSize: 10, fontWeight: 600, padding: "4px 9px", borderRadius: 20,
      display: "flex", alignItems: "center", gap: 4, zIndex: 2,
    }}>
      <span>{badge.icon}</span>{badge.label}
    </span>
  );
}
