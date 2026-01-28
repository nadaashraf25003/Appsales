import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fixes the "isValidElementType" and "default export" errors for MUI
      "prop-types": "prop-types/prop-types.js",
    },
  },
  optimizeDeps: {
    include: [
      "prop-types",
      "react-is",
      "@mui/material",
      "@mui/utils",
      "@mui/system",
      "@emotion/react",
      "@emotion/styled",
    ],
    // Prevents Vite from crawling 5,000+ icons on every load
    exclude: ["@mui/icons-material"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Updated to your local backend target
        target: "https://localhost:7115", 
        changeOrigin: true,
        secure: false, // Set to false since you're using a local self-signed cert
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});