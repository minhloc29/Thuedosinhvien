import React from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import "../theme/global.css";

// Separate admin frontend entry — served at /admin.html. No landing page:
// admins land straight on the (admin-only) login gate.
const container = document.getElementById("root");
createRoot(container).render(<AdminApp />);
