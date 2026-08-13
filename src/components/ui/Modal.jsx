import { T, F } from "../../theme/tokens";
import { X } from "lucide-react";

// Centered overlay dialog with a close button; children render as the body.
export default function Modal({ onClose, children, width = 460 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(32,26,21,0.42)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rm-scroll"
        style={{
          background: T.surface, borderRadius: 18, width: "100%", maxWidth: width,
          maxHeight: "88vh", overflowY: "auto", padding: 26, position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%",
            border: `1px solid ${T.line}`, background: T.surface, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}
        >
          <X size={15} color={T.ink} />
        </button>
        {children}
      </div>
    </div>
  );
}
