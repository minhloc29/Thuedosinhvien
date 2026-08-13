import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Deployed to GitHub Pages under the repo sub-path; absolute asset URLs
  // (the default) would 404 there. Keep in sync with the repo name.
  base: "/Thuedosinhvien/",
});
