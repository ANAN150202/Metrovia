// ReactDOM entry point (Vite)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // global styles + Tailwind

// ─────────────────────────────────────────────────────────────
// main.jsx — Application Entry Point
//
// This is the very first file that runs.
// It mounts the entire React app into the <div id="root">
// element inside public/index.html.
//
// StrictMode is a development helper — it:
//   - Highlights potential problems in the app
//   - Does NOT affect production build
// ─────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);