import React from "react";
import { T, F } from "../../theme/tokens";

export const TIMELINE_STEPS = ["Đặt phòng", "Chủ xác nhận", "Nhận đồ", "Đang sử dụng", "Trả đồ", "Hoàn tất"];
// Which step a booking is currently on, given its status + handover stage.
export function stepIndex(booking) {
  if (booking.status === "pending") return 1;
  if (booking.status === "completed") return 5;
  if (booking.handoverStage === "picked_up") return 3;
  return 2; // confirmed, awaiting handover
}

// Horizontal stepper visualising the rental lifecycle.
export default function RentalTimeline({ booking }) {
  const current = stepIndex(booking);
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
      {TIMELINE_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: i === 0 || i === TIMELINE_STEPS.length - 1 ? "0 0 auto" : 1 }}>
              <div style={{
                width: 9, height: 9, borderRadius: "50%",
                background: done ? T.teal : active ? T.accent : T.line,
              }} />
              <span style={{ fontFamily: F.body, fontSize: 9, color: done || active ? T.inkSoft : T.inkFaint, marginTop: 4, textAlign: "center", maxWidth: 52 }}>{label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, background: i < current ? T.teal : T.line, marginBottom: 14 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
