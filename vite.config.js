import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Data files the site displays. bookings.json is left out on purpose:
// it changes whenever someone books, and that shouldn't refresh the page.
const LIVE_DATA_FILES = ["menu", "gallery", "info"].map((name) =>
  path.resolve("server/data", `${name}.json`),
);

// Dev only: when a data file is saved, tell the browser so it can refetch
// that data in place (no full reload, so scroll position and form input survive).
function liveApiData() {
  return {
    name: "live-api-data",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(LIVE_DATA_FILES);
      let timer;
      server.watcher.on("change", (file) => {
        if (!LIVE_DATA_FILES.includes(file)) return;
        // Short wait so editors that save in several steps have finished writing
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.ws.send({
            type: "custom",
            event: "api-data-changed",
            data: { file: path.basename(file) },
          });
          server.config.logger.info(
            `${path.basename(file)} changed, refreshing data in the browser`,
            { timestamp: true },
          );
        }, 150);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), liveApiData()],
  server: {
    // Forward API calls to the Express server (npm run dev:api)
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
