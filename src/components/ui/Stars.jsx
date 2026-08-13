import { T } from "../../theme/tokens";
import { Star } from "lucide-react";

// 5-star read-only rating control.
export default function Stars({ count, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < count ? T.accent : "none"} color={i < count ? T.accent : T.line} strokeWidth={1.5} />
      ))}
    </span>
  );
}
