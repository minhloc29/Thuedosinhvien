import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    // Dev-only: rewrite GET /admin and /admin/* to the admin MPA entry so the
    // host-relative route used in prod also works under the Vite dev server.
    name: "admin-route-to-admin-html",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/admin" || req.url.startsWith("/admin/")) {
          req.url = "/admin.html" + req.url.slice("/admin".length);
        }
        next();
      });
    },
  }],
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
