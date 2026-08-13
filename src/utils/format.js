// Formatting helpers reused across display components.

export const money = (n) => Math.round(n).toLocaleString("vi-VN") + "đ";

// Compact money for tight spaces: "26tr" or "720k".
export const moneyShort = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "tr"
    : Math.round(n / 1000) + "k";
