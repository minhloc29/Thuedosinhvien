// ---------------------------------------------------------------------------
// LabShare — ChartPanel
//
// Zero-dependency SVG chart for the admin dashboard. Renders three chart types
// (pie / donut / bar) + a shared HTML legend, using the app's design tokens so
// it reads as one system with the rest of LabShare. A per-slice `color` in the
// data wins; otherwise the default categorical palette is cycled.
//
// Props:
//   type      'pie' | 'donut' | 'bar'
//   data      [{ label, value, color? }]
//   palette   optional array of colors (defaults to the T categorical palette)
//   size      overall px (pie/donut square)
//   thickness donut ring thickness
//   format    optional fn(value) -> string for the legend + bar labels
// ---------------------------------------------------------------------------
import React from "react";
import { T } from "../lib/shared";

const DEFAULT_PALETTE = [T.accent, T.teal, T.purple, T.green, T.danger, T.inkSoft];

const colorFor = (d, i, palette) => d.color || palette[i % palette.length];

function Legend({ items, right }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: it.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "inherit", fontSize: 12, color: T.inkSoft, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
          <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", fontSize: 11.5, fontWeight: 600, color: T.ink }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ data, palette, size, format }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -Math.PI / 2; // start at 12 o'clock

  const wedge = (d, color) => {
    const frac = d.value / total;
    const a2 = angle + frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = frac > 0.5 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle = a2;
    return (
      <path key={d.label} d={path} fill={color}>
        <title>{`${d.label}: ${format ? format(d.value) : d.value} (${Math.round(frac * 100)}%)`}</title>
      </path>
    );
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {data.map((d, i) => wedge(d, colorFor(d, i, palette)))}
      <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, fill: T.ink }}>
        {format ? format(total) : total}
      </text>
    </svg>
  );
}

function DonutChart({ data, palette, size, thickness, format }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      {data.map((d, i) => {
        const seg = (d.value / total) * C;
        const el = (
          <circle
            key={d.label}
            r={R}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            stroke={colorFor(d, i, palette)}
            strokeWidth={thickness}
            strokeDasharray={`${seg} ${C - seg}`}
            strokeDashoffset={-offset}
          >
            <title>{`${d.label}: ${format ? format(d.value) : d.value} (${Math.round((d.value / total) * 100)}%)`}</title>
          </circle>
        );
        offset += seg;
        return el;
      })}
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: 700, fill: T.ink }}>
        {format ? format(total) : total}
      </text>
    </svg>
  );
}

function BarChart({ data, palette, size, format }) {
  const chartW = size * 1.4;
  const chartH = 150;
  const padBottom = 24;
  const max = Math.max(...data.map((d) => d.value), 1);
  const usable = data.length > 0 ? chartW / data.length : chartW;
  const barW = Math.min(34, usable * 0.55);

  return (
    <svg width={chartW} height={chartH + padBottom} viewBox={`0 0 ${chartW} ${chartH + padBottom}`} style={{ width: "100%", maxWidth: chartW, flexShrink: 0 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const y = chartH - g * (chartH - 18);
        return (
          <line key={g} x1={0} y1={y} x2={chartW} y2={y} stroke={T.line} strokeWidth={1} strokeDasharray={g === 0 ? "0" : "3 4"} />
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * (chartH - 18);
        const x = i * usable + (usable - barW) / 2 + barW * 0.05;
        const y = chartH - h;
        const color = colorFor(d, i, palette);
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={color}>
              <title>{`${d.label}: ${format ? format(d.value) : d.value}`}</title>
            </rect>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, fontWeight: 600, fill: T.inkSoft }}>
              {format ? format(d.value) : d.value}
            </text>
            <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" style={{ fontFamily: "inherit", fontSize: 9.5, fill: T.inkFaint }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ChartPanel({ type = "pie", data = [], palette = DEFAULT_PALETTE, size = 200, thickness = 26, format }) {
  const items = data.filter((d) => d.value > 0).map((d, i) => ({ ...d, color: colorFor(d, i, palette) }));

  let chart;
  if (type === "donut") chart = <DonutChart data={items} palette={palette} size={size} thickness={thickness} format={format} />;
  else if (type === "bar") chart = <BarChart data={items} palette={palette} size={size} format={format} />;
  else chart = <PieChart data={items} palette={palette} size={size} format={format} />;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      {chart}
      <div style={{ flex: 1, minWidth: 120 }}>
        <Legend
          items={items.map((d) => ({ label: d.label, color: d.color, value: format ? format(d.value) : d.value }))}
        />
      </div>
    </div>
  );
}
