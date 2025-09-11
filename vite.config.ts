import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // 🔹 Important for Capacitor: all paths relative
  base: "./",

  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Root folder of your web app
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    // Output folder (Capacitor's webDir should point here)
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Make sure JS/CSS paths are relative
    assetsDir: "assets",
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
