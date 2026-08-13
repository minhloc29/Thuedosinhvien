import { T } from "../../theme/tokens";

// Clickable surface used for product cards and list rows.
export default function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.surface, borderRadius: 14, border: `1px solid ${T.line}`,
        cursor: onClick ? "pointer" : "default", transition: "border-color .15s", position: "relative",
        ...style,
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.borderColor = T.ink)}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.borderColor = T.line)}
    >
      {children}
    </div>
  );
}
