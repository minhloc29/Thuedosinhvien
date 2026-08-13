import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import LandingPage from "./features/landing/LandingPage";
import "./theme/global.css";

// Landing page shows first; the app shell mounts once the visitor enters.
function Root() {
  const [entered, setEntered] = useState(false);
  return (
    <React.StrictMode>
      {entered ? <App /> : <LandingPage onEnter={() => setEntered(true)} />}
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
createRoot(container).render(<Root />);
