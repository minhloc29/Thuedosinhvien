import { T, F } from "../../theme/tokens";

// Standard screen header: title, optional subtitle, optional right-side action.
export default function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkFaint, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
