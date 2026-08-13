import { useState, useMemo } from "react";
import { T, F } from "../theme/tokens";
import { PRODUCTS } from "../data/products";
import Sidebar from "../components/layout/Sidebar";
import HomeScreen from "../features/home/HomeScreen";
import DetailScreen from "../features/detail/DetailScreen";
import MyRentalsScreen from "../features/rentals/MyRentalsScreen";
import RequestsScreen from "../features/requests/RequestsScreen";
import MyListingsScreen from "../features/listings/MyListingsScreen";
import ProfileScreen from "../features/profile/ProfileScreen";
import AddEquipmentModal from "../features/listing-form/AddEquipmentModal";
import ConfirmedModal from "../features/booking/ConfirmedModal";
import { QRModal } from "../features/booking/QRModal";
import ReturnChecklistModal from "../features/booking/ReturnChecklistModal";
import { CompareBar, CompareModal } from "../features/compare/Compare";

const INITIAL_REQUESTS = [
  { id: "r1", status: "pending", renterName: "Hải Đăng", start: "2026-08-18", end: "2026-08-20", product: PRODUCTS.find((p) => p.id === "p6") },
  { id: "r2", status: "confirmed", renterName: "Thu Hà", start: "2026-08-10", end: "2026-08-12", product: PRODUCTS.find((p) => p.id === "p6") },
];

const MAX_COMPARE = 3;

// Application shell: owns navigation, filters, domain collections, and the
// compare + handover (QR / return) flows, wiring the screens and modals together.
export default function App({ onExit }) {
  const [screen, setScreen] = useState("home");
  const [role, setRole] = useState("renter");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState(null);
  const [maxPrice, setMaxPrice] = useState(160000);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [qrBooking, setQrBooking] = useState(null);
  const [returnBooking, setReturnBooking] = useState(null);

  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [myBookings, setMyBookings] = useState([]);
  const [myListings, setMyListings] = useState(PRODUCTS.filter((p) => p.mine));
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.mine) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [query, catFilter, maxPrice]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const openProduct = (p) => { setSelectedProduct(p); setScreen("detail"); setCompareOpen(false); };

  const confirmBooking = (b) => {
    const id = "b" + Date.now();
    setMyBookings((list) => [{ id, ...b, status: "pending", handoverStage: null }, ...list]);
    setConfirmedBooking({ ...b, id });
  };

  const respondRequest = (id, status) => setRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));

  const addListing = (listing) => {
    setMyListings((list) => [listing, ...list]);
    setAddModalOpen(false);
    setScreen("myListings");
  };

  const toggleCompare = (id) => setCompareIds((ids) => {
    if (ids.includes(id)) return ids.filter((x) => x !== id);
    if (ids.length >= MAX_COMPARE) return ids;
    return [...ids, id];
  });

  const updateBooking = (id, patch) => setMyBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const compareProducts = PRODUCTS.filter((p) => compareIds.includes(p.id));

  let body;
  if (screen === "home") {
    body = (
      <HomeScreen
        products={filteredProducts} onOpen={openProduct}
        query={query} setQuery={setQuery}
        catFilter={catFilter} setCatFilter={setCatFilter}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        compareIds={compareIds} onToggleCompare={toggleCompare}
      />
    );
  } else if (screen === "detail") {
    body = <DetailScreen product={selectedProduct} onConfirm={confirmBooking} />;
  } else if (screen === "myRentals") {
    body = <MyRentalsScreen bookings={myBookings} onOpenQR={setQrBooking} onOpenReturn={setReturnBooking} />;
  } else if (screen === "requests") {
    body = <RequestsScreen requests={requests} onRespond={respondRequest} />;
  } else if (screen === "myListings") {
    body = <MyListingsScreen listings={myListings} onAdd={() => setAddModalOpen(true)} />;
  } else if (screen === "profile") {
    body = <ProfileScreen role={role} setRole={setRole} listingsCount={myListings.length} bookingsCount={myBookings.length} />;
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: F.body }}>
      <div className="rm-shell">
        <Sidebar screen={screen} setScreen={setScreen} role={role} setRole={setRole} pendingCount={pendingCount} compareCount={compareIds.length} onAdd={() => setAddModalOpen(true)} onExit={onExit} />
        <main className="rm-main" style={{ padding: "28px 32px 90px", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
          {screen === "detail" && (
            <button
              onClick={() => setScreen("home")}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer",
                padding: 0, marginBottom: 16, fontFamily: F.body, fontSize: 12.5, color: T.inkSoft,
              }}
            >
              ← Quay lại danh sách
            </button>
          )}
          {body}
        </main>
      </div>

      {screen === "home" && <CompareBar ids={compareIds} onOpen={() => setCompareOpen(true)} onClear={() => setCompareIds([])} />}
      {compareOpen && <CompareModal products={compareProducts} onClose={() => setCompareOpen(false)} onOpenDetail={(p) => { setCompareOpen(false); openProduct(p); }} />}

      {addModalOpen && <AddEquipmentModal onClose={() => setAddModalOpen(false)} onSubmit={addListing} />}
      {confirmedBooking && <ConfirmedModal booking={confirmedBooking} onClose={() => { setConfirmedBooking(null); setScreen("myRentals"); }} />}
      {qrBooking && (
        <QRModal booking={qrBooking} onClose={() => setQrBooking(null)} onConfirm={() => { updateBooking(qrBooking.id, { handoverStage: "picked_up" }); setQrBooking(null); }} />
      )}
      {returnBooking && (
        <ReturnChecklistModal booking={returnBooking} onClose={() => setReturnBooking(null)} onConfirm={() => { updateBooking(returnBooking.id, { status: "completed", handoverStage: "returned" }); setReturnBooking(null); }} />
      )}
    </div>
  );
}
