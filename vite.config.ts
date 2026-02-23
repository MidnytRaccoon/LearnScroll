import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:5001", // Match exactly with HOST and PORT in index.ts
      changeOrigin: true,
      secure: false,
    },
  },
    fs: {
      strict: false, // Changed to false to allow accessing 'shared' folder outside root
    },
  },
});