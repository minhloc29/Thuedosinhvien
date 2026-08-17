import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the build works wherever it's hosted: at the root
  // (Vercel) or under a repo sub-path (GitHub Pages). No hardcoded path.
  base: "./",
  build: {
    // Two HTML entries: the user app (renter/senior) and the separate admin FE.
    rollupOptions: {
      input: { main: "index.html", admin: "admin.html" },
    },
  },
  server: {
    // Dev: forward /api/* and /auth/* to the Express backend so the frontend
    // can call same-origin URLs without CORS/config juggling.
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/auth": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
