import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for CampusConnect frontend
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(), // enables React JSX transform + Fast Refresh
  ],

  // Dev server settings
  server: {
    port: 5173, // default Vite port — matches CORS setting in backend
    open: true, // auto-open browser on npm run dev
  },
});