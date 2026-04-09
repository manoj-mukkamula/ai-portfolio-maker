// vite.config.ts
// Build config for AI Portfolio Maker frontend.
// Changes from original:
//  - Removed "lovable-tagger" plugin (Lovable-specific, causes import errors without their tooling)
//  - Added /api proxy → backend on port 5000 (avoids CORS in dev when running both on localhost)
//  - VITE_API_URL env var still takes priority in production (set in .env)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // ✅ Proxy /api requests to the backend — eliminates CORS issues in development
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
});
