// Axios instance with base URL and auth token header
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// api.js — Centralized Axios Instance
//
// Every API call in the app goes through this instance.
// This means:
//   - Base URL is set once here (from .env)
//   - Auth token is attached automatically to every request
//   - We never hardcode URLs in components
// ─────────────────────────────────────────────────────────────

const api = axios.create({
  // Read base URL from .env file
  // In .env: VITE_API_BASE_URL=http://localhost:5000
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────
// Runs BEFORE every request is sent.
// Automatically reads the token from localStorage and attaches
// it as an Authorization header.
//
// This means you never need to manually add the token in
// components or service files — it's handled here globally.
// ─────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Get the token saved during login
    const token = localStorage.getItem("token");

    if (token) {
      // Attach token to every outgoing request
      // Format: Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // always return config so the request proceeds
  },
  (error) => {
    // Request setup failed (rare — network issue before sending)
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────
// Runs AFTER every response comes back.
// Handles global error cases so components don't have to.
// ─────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    // Successful response — just pass it through
    return response;
  },
  (error) => {
    // Extract the HTTP status code from the response
    const status = error.response?.status;

    if (status === 401) {
      // 401 Unauthorized — token is missing, invalid, or expired.
      // Clear stored credentials and redirect to login.
      // This handles cases like:
      //   - Token expired after 7 days
      //   - Someone manually tampered with the token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if we're not already on the login page
      // (prevents infinite redirect loop)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      // 403 Forbidden — user is logged in but doesn't have permission.
      // Example: a student trying to access /admin
      // Components can handle this individually, but we log it here.
      console.warn("Access denied (403). You do not have permission.");
    }

    // Always reject the promise so the calling code can catch it
    return Promise.reject(error);
  }
);

export default api;