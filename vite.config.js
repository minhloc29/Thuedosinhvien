import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the build works wherever it's hosted: at the root
  // (Vercel) or under a repo sub-path (GitHub Pages). No hardcoded path.
  base: "./",
});
