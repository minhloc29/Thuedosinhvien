import { T, F } from "../../theme/tokens";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { X, Check } from "lucide-react";

// Owner view: incoming rental requests to approve or reject.
export default function RequestsScreen({ requests, onRespond }) {
  return (
    <div>
      <PageHeader title="Yêu cầu thuê" subtitle="Duyệt các yêu cầu thuê món đồ của bạn." />
      {requests.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>📭</p>
          <p style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>Chưa có yêu cầu nào</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.map((r) => (
            <Card key={r.id} style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 30 }}>{r.product.emoji}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: T.ink, margin: 0 }}>{r.product.name}</p>
                <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkFaint, margin: "3px 0 0" }}>Từ {r.renterName}</p>
                <p style={{ fontFamily: F.mono, fontSize: 11, color: T.inkFaint, margin: "2px 0 0" }}>{r.start} → {r.end}</p>
              </div>
              <StatusBadge status={r.status} />
              {r.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <SecondaryButton onClick={() => onRespond(r.id, "rejected")} icon={X}>Từ chối</SecondaryButton>
                  <PrimaryButton onClick={() => onRespond(r.id, "confirmed")} icon={Check} style={{ width: "auto", padding: "10px 16px" }}>Đồng ý</PrimaryButton>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
