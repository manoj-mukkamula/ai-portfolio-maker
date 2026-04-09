// frontend/vite.config.ts
//
// FIX: Added /api proxy to backend.
// This means frontend can use just "/api/..." without needing VITE_API_URL.
// Solves CORS issues in development automatically.

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
    proxy: {
      // All /api requests are proxied to the backend
      // This means api.ts can use baseURL: "/api" and it just works
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
  },
});