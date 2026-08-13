import { T } from "../theme/tokens";
import { PRODUCTS } from "../data/products";

// --- Owner trust score (0-100) ---------------------------------------------
// Combines rating, verified status, completed rentals and response rate.
export const trustScore = (owner) =>
  Math.round(
    (owner.rating / 5) * 40 +
    (owner.verified ? 20 : 0) +
    (Math.min(owner.rentalsCount, 30) / 30) * 25 +
    (owner.responseRate / 100) * 15
  );

// --- Renting vs buying savings ----------------------------------------------
// Returns the rental cost for `days` and the percentage saved vs. buying new.
export const savingsFor = (product, days = 5) => {
  const rentalCost = product.price * days;
  const pct = Math.round((1 - rentalCost / product.buyPrice) * 100);
  return { rentalCost, pct: Math.max(pct, 0), days };
};

// --- Best-match badges -------------------------------------------------------
// Precomputed once over the browsable catalogue: cheapest, nearest, most trusted.
const buildMatchBadges = () => {
  const list = PRODUCTS.filter((p) => !p.mine);
  const byPrice = [...list].sort((a, b) => a.price - b.price)[0];
  const byDistance = [...list].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))[0];
  const trusted = [...list]
    .filter((p) => p.rating >= 4.8 && p.reviewCount >= 15)
    .sort((a, b) => trustScore(b.owner) - trustScore(a.owner))[0];
  const map = {};
  if (trusted) map[trusted.id] = { icon: "🛡️", label: "Đáng tin cậy nhất", bg: T.tealBg, fg: T.tealDeep };
  if (byPrice && !map[byPrice.id]) map[byPrice.id] = { icon: "💰", label: "Giá tốt nhất", bg: T.accentBg, fg: T.accentDeep };
  if (byDistance && !map[byDistance.id]) map[byDistance.id] = { icon: "📍", label: "Gần bạn nhất", bg: T.greenBg, fg: T.green };
  return map;
};

export const MATCH_BADGES = buildMatchBadges();
