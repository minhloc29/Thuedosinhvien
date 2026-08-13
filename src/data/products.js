// Mock catalogue data. In a real app this would come from an API layer;
// PRODUCTS is kept as the static source for the MVP.
// Each product carries the full v2 shape: buyPrice, lastInspected,
// conditionDetails, included/notIncluded, unavailableDays, and a rich owner.

export const PRODUCTS = [
  {
    id: "p1", name: "MacBook Air M1", category: "laptop", price: 70000, buyPrice: 19000000,
    location: "Bách Khoa", distance: "0.8 km", rating: 4.8, reviewCount: 23,
    condition: "Rất tốt", deposit: 500000, lastInspected: "10/08/2026",
    conditionDetails: [
      { label: "Pin", value: "92%" }, { label: "Màn hình", value: "Không trầy xước" },
      { label: "Bàn phím", value: "Hoạt động tốt" }, { label: "Vỏ máy", value: "Trầy nhẹ ở góc" },
    ],
    included: ["Sạc gốc 30W", "Túi đựng"], notIncluded: ["Chuột", "Màn hình ngoài"],
    owner: { name: "Minh Nguyễn", rating: 4.9, verified: true, rentalsCount: 27, responseRate: 98, responseTime: "< 10 phút", memberSince: 2025 },
    availability: "15/08 → 30/08", unavailableDays: [5, 6, 7, 20, 21], emoji: "💻",
    desc: "MacBook Air M1 8GB/256GB, dùng cho đồ án, code nhẹ, thiết kế cơ bản. Đầy đủ sạc, hộp đựng.",
    reviews: [
      { rating: 5, comment: "Máy sạch, chạy mượt, đúng như mô tả.", author: "Hải" },
      { rating: 5, comment: "Chủ nhà phản hồi nhanh, giao đúng hẹn.", author: "Lan" },
      { rating: 4, comment: "Điểm hẹn hơi xa nhưng ổn.", author: "Đức" },
    ],
  },
  {
    id: "p2", name: "MacBook Air M2", category: "laptop", price: 90000, buyPrice: 26000000,
    location: "Hai Bà Trưng", distance: "2.1 km", rating: 4.9, reviewCount: 31,
    condition: "Như mới", deposit: 800000, lastInspected: "08/08/2026",
    conditionDetails: [
      { label: "Pin", value: "97%" }, { label: "Màn hình", value: "Không trầy xước" },
      { label: "Bàn phím", value: "Như mới" }, { label: "Vỏ máy", value: "Như mới" },
    ],
    included: ["Sạc gốc 35W", "Túi đựng", "Cáp USB-C"], notIncluded: ["Chuột"],
    owner: { name: "Thảo Vy", rating: 4.8, verified: true, rentalsCount: 31, responseRate: 96, responseTime: "< 15 phút", memberSince: 2024 },
    availability: "10/08 → 25/08", unavailableDays: [1, 2, 12, 13, 14], emoji: "💻",
    desc: "MacBook Air M2 16GB/512GB, phù hợp dựng video, thiết kế đồ hoạ, làm đồ án tốt nghiệp.",
    reviews: [
      { rating: 5, comment: "Máy mạnh, pin trâu, rất đáng thuê.", author: "Nam" },
      { rating: 5, comment: "Đóng gói cẩn thận, an tâm.", author: "Chi" },
    ],
  },
  {
    id: "p3", name: "iPhone 15", category: "phone", price: 100000, buyPrice: 22000000,
    location: "Hai Bà Trưng", distance: "2.1 km", rating: 4.9, reviewCount: 18,
    condition: "Như mới", deposit: 1000000, lastInspected: "11/08/2026",
    conditionDetails: [
      { label: "Pin", value: "94%" }, { label: "Màn hình", value: "Không trầy xước" },
      { label: "Camera", value: "Hoạt động tốt" }, { label: "Vỏ máy", value: "Như mới" },
    ],
    included: ["Sạc nhanh 20W", "Ốp lưng"], notIncluded: ["Tai nghe"],
    owner: { name: "Thảo Vy", rating: 4.8, verified: true, rentalsCount: 31, responseRate: 96, responseTime: "< 15 phút", memberSince: 2024 },
    availability: "12/08 → 28/08", unavailableDays: [3, 4, 5], emoji: "📱",
    desc: "iPhone 15 128GB màu xanh, dùng quay video sản phẩm, chụp ảnh sự kiện.",
    reviews: [{ rating: 5, comment: "Máy đẹp, pin tốt.", author: "Quỳnh" }],
  },
  {
    id: "p4", name: "iPhone 13", category: "phone", price: 60000, buyPrice: 13000000,
    location: "Đống Đa", distance: "3.4 km", rating: 4.6, reviewCount: 12,
    condition: "Tốt", deposit: 700000, lastInspected: "05/08/2026",
    conditionDetails: [
      { label: "Pin", value: "89%" }, { label: "Màn hình", value: "1 vết xước nhỏ" },
      { label: "Camera", value: "Hoạt động tốt" }, { label: "Vỏ máy", value: "Trầy nhẹ viền" },
    ],
    included: ["Cáp sạc"], notIncluded: ["Củ sạc", "Ốp lưng"],
    owner: { name: "Anh Tuấn", rating: 4.7, verified: true, rentalsCount: 9, responseRate: 90, responseTime: "< 30 phút", memberSince: 2025 },
    availability: "13/08 → 20/08", unavailableDays: [8, 9], emoji: "📱",
    desc: "iPhone 13 128GB, pin 89%, có vài vết xước nhỏ ở viền, dùng vẫn ổn định.",
    reviews: [{ rating: 4, comment: "Đúng mô tả, pin hơi chai nhẹ.", author: "Bình" }],
  },
  {
    id: "p5", name: "Canon EOS M50", category: "camera", price: 120000, buyPrice: 15500000,
    location: "Cầu Giấy", distance: "4.0 km", rating: 4.7, reviewCount: 15,
    condition: "Tốt", deposit: 1500000, lastInspected: "09/08/2026",
    conditionDetails: [
      { label: "Cảm biến", value: "Sạch, không bụi" }, { label: "Ống kính", value: "Không trầy" },
      { label: "Pin", value: "2 viên kèm theo" }, { label: "Màn hình LCD", value: "Hoạt động tốt" },
    ],
    included: ["Lens kit 15-45mm", "Thẻ nhớ 32GB", "Pin + sạc"], notIncluded: ["Chân máy", "Túi đựng"],
    owner: { name: "Gia Bảo", rating: 4.6, verified: true, rentalsCount: 15, responseRate: 94, responseTime: "< 20 phút", memberSince: 2025 },
    availability: "14/08 → 22/08", unavailableDays: [10, 11, 12, 25], emoji: "📷",
    desc: "Canon EOS M50 kèm lens kit 15-45mm, thẻ nhớ 32GB, phù hợp quay vlog, chụp sự kiện trường.",
    reviews: [
      { rating: 5, comment: "Máy chụp nét, có hướng dẫn dùng chi tiết.", author: "Huyền" },
      { rating: 4, comment: "Ổn, pin dùng được nửa ngày.", author: "Phong" },
    ],
  },
  {
    id: "p6", name: "Loa Bluetooth JBL Flip 6", category: "audio", price: 40000, buyPrice: 2900000,
    location: "Bách Khoa", distance: "0.5 km", rating: 4.9, reviewCount: 9,
    condition: "Rất tốt", deposit: 300000, lastInspected: "12/08/2026",
    conditionDetails: [
      { label: "Pin", value: "95%" }, { label: "Loa/màng loa", value: "Không rè" }, { label: "Vỏ ngoài", value: "Như mới" },
    ],
    included: ["Cáp sạc USB-C"], notIncluded: ["Túi đựng"],
    owner: { name: "Bạn", rating: 5.0, verified: true, rentalsCount: 5, responseRate: 100, responseTime: "< 5 phút", memberSince: 2026 },
    availability: "Đang cho thuê", unavailableDays: [], emoji: "🎙️",
    desc: "Loa JBL Flip 6 chống nước, âm bass mạnh, phù hợp sự kiện nhỏ, sinh nhật, họp lớp.",
    reviews: [{ rating: 5, comment: "Âm thanh to rõ, chủ nhà dễ chịu.", author: "Yến" }],
    mine: true,
  },
  {
    id: "p7", name: "Máy chiếu Epson EB-X06", category: "projector", price: 150000, buyPrice: 9500000,
    location: "Thanh Xuân", distance: "5.2 km", rating: 4.5, reviewCount: 7,
    condition: "Tốt", deposit: 1200000, lastInspected: "02/08/2026",
    conditionDetails: [
      { label: "Bóng đèn", value: "Còn ~1800 giờ" }, { label: "Ống kính", value: "Sạch, không mờ" }, { label: "Vỏ máy", value: "Trầy nhẹ" },
    ],
    included: ["Dây HDMI", "Màn chiếu di động", "Remote"], notIncluded: ["Chân đế"],
    owner: { name: "Đình Khoa", rating: 4.5, verified: false, rentalsCount: 4, responseRate: 80, responseTime: "< 1 giờ", memberSince: 2026 },
    availability: "16/08 → 24/08", unavailableDays: [1, 2, 3, 18, 19], emoji: "📽️",
    desc: "Máy chiếu Epson 3600 lumens, kèm dây HDMI và màn chiếu di động 100 inch.",
    reviews: [{ rating: 4, comment: "Ảnh sáng rõ, dùng cho báo cáo nhóm rất tốt.", author: "Sơn" }],
  },
  {
    id: "p8", name: "iPad Air 5", category: "laptop", price: 65000, buyPrice: 16500000,
    location: "Bách Khoa", distance: "1.1 km", rating: 4.7, reviewCount: 11,
    condition: "Rất tốt", deposit: 600000, lastInspected: "07/08/2026",
    conditionDetails: [
      { label: "Pin", value: "93%" }, { label: "Màn hình", value: "Không trầy xước" }, { label: "Vỏ máy", value: "Như mới" },
    ],
    included: ["Apple Pencil thế hệ 2", "Sạc gốc"], notIncluded: ["Bàn phím rời"],
    owner: { name: "Minh Nguyễn", rating: 4.9, verified: true, rentalsCount: 27, responseRate: 98, responseTime: "< 10 phút", memberSince: 2025 },
    availability: "15/08 → 29/08", unavailableDays: [14, 15, 16], emoji: "💻",
    desc: "iPad Air 5 kèm Apple Pencil thế hệ 2, phù hợp vẽ kỹ thuật, ghi chú, đọc tài liệu.",
    reviews: [{ rating: 5, comment: "Có bút đi kèm, rất tiện.", author: "Trang" }],
  },
];
