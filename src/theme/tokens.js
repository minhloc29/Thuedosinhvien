// Design tokens: color scale and font stacks used across the app.
// Centralizing them here means a rebrand or theme is a single-file change.
//
// "Cool tech" direction: cool grey-blue ground, navy ink, amber accent,
// teal secondary. Display in a serif (Fraunces) for a less generic feel.

export const T = {
  bg: "#EEF1F6",        // cool grey-blue paper
  surface: "#FFFFFF",
  ink: "#161E33",       // navy ink
  inkSoft: "#5B6478",
  inkFaint: "#909AAE",
  accent: "#F2A93B",    // amber
  accentDeep: "#8A5A0D",
  accentBg: "#FDF0DA",
  teal: "#2A6F68",      // teal
  tealBg: "#E3F1EF",
  tealDeep: "#1B4B46",
  line: "#DCE1EA",
  danger: "#C1443C",
  dangerBg: "#FBEAE8",
  green: "#3C7A45",
  greenBg: "#E7F3E8",
  purple: "#5B4FA8",
  purpleBg: "#EBE8F7",
};

export const F = {
  display: `'Fraunces', ui-serif, 'New York', Georgia, 'Times New Roman', serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  mono: `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`,
};
