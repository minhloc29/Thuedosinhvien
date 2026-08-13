// Product categories and their shared lookup helper.

export const CATS = [
  { id: "laptop", label: "Laptop", emoji: "💻" },
  { id: "phone", label: "Điện thoại", emoji: "📱" },
  { id: "camera", label: "Máy ảnh", emoji: "📷" },
  { id: "audio", label: "Âm thanh", emoji: "🎙️" },
  { id: "projector", label: "Máy chiếu", emoji: "📽️" },
];

export const catInfo = (id) => CATS.find((c) => c.id === id) || CATS[0];

// Shared option lists reused by the listing form and the booking flow.
export const LOCATIONS = ["Bách Khoa", "Hai Bà Trưng", "Đống Đa", "Cầu Giấy", "Thanh Xuân"];
export const CONDITIONS = ["Như mới", "Rất tốt", "Tốt", "Khá"];
