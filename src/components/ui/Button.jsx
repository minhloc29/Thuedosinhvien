import { T, F } from "../../theme/tokens";

// Primary: solid filled call-to-action.
export function PrimaryButton({ children, onClick, disabled, style, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "13px 16px", borderRadius: 12, border: "none",
        background: disabled ? T.line : T.accent, color: disabled ? T.inkFaint : "#fff",
        fontFamily: F.display, fontWeight: 600, fontSize: 14.5,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.2, ...style,
      }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

// Secondary: outlined / ghost action. `active` renders the filled "pressed" state.
export function SecondaryButton({ children, onClick, style, icon: Icon, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px", borderRadius: 12, border: `1px solid ${active ? T.accent : T.line}`,
        background: active ? T.accent : T.surface, color: active ? "#fff" : T.ink,
        fontFamily: F.body, fontWeight: 500, fontSize: 13.5,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", ...style,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
