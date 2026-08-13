import { useMemo } from "react";

const DAY_MS = 86400000;
const DELIVERY_FEE = 30000;

// Pure pricing logic for a rental booking, lifted out of the UI so it can be
// tested and reused independently of BookingPanel.
export default function useBookingPricing({ start, end, pickup, price, deposit }) {
  return useMemo(() => {
    if (!start || !end) return { nights: 0, rentalCost: 0, deliveryFee: pickup === "delivery" ? DELIVERY_FEE : 0, total: deposit, valid: false };
    const rawNights = (new Date(end) - new Date(start)) / DAY_MS;
    const nights = rawNights > 0 ? Math.round(rawNights) : 0;
    const rentalCost = Math.max(nights, 0) * price;
    const deliveryFee = pickup === "delivery" ? DELIVERY_FEE : 0;
    const total = rentalCost + deposit + deliveryFee;
    return { nights, rentalCost, deliveryFee, total, valid: nights > 0 };
  }, [start, end, pickup, price, deposit]);
}
