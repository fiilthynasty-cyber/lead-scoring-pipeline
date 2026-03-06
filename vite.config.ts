import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Vite configuration
export default defineConfig({
  root: path.resolve(import.meta.dirname, "client"), // Set root folder to "client"
  publicDir: path.resolve(import.meta.dirname, "client", "public"), // Point to "public" folder for static files
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,  // Increase the warning limit to 1000 KB
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
