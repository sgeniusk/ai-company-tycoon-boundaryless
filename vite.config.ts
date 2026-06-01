import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          if (id.includes("/data/") && id.endsWith(".json")) {
            return "game-data";
          }
          // v0.99 — split the game logic out of the entry so the main chunk
          // stays under the 500 kB Vite warning (loads eagerly, just bundled apart).
          if (id.includes("/src/game/")) {
            return "game-logic";
          }
        },
      },
    },
  },
});
