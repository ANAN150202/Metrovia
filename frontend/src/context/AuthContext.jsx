// Global auth state: user, token, login(), logout()
import { createContext, useState, useEffect, useContext } from "react";

// ─────────────────────────────────────────────────────────────
// AuthContext.jsx — Global Authentication State
//
// This context provides auth state to the ENTIRE app.
// Any component can access:
//   - user       → the logged-in user object (or null)
//   - token      → the JWT token string (or null)
//   - loading    → true while restoring session on app load
//   - login()    → call this after a successful login API call
//   - logout()   → call this to log the user out
//
// Usage in any component:
//   import { useAuthContext } from "../context/AuthContext";
//   const { user, login, logout } = useAuthContext();
//
// Or use the cleaner custom hook:
//   import useAuth from "../hooks/useAuth";
//   const { user, login, logout } = useAuth();
// ─────────────────────────────────────────────────────────────

// Step 1: Create the context object
// This is the "container" that holds our auth state globally
const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
// AuthProvider Component
//
// Wrap your entire app with this so every component can
// access auth state. Done in App.jsx like:
//   <AuthProvider>
//     <AppRoutes />
//   </AuthProvider>
// ─────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  // ── State ──────────────────────────────────────────────────

  // The logged-in user object
  // Shape: { _id, name, email, role, avatar, bio, ... }
  const [user, setUser] = useState(null);

  // The JWT token string
  const [token, setToken] = useState(null);

  // True while we're reading localStorage on first app load
  // Prevents the app from flashing the login page briefly
  // before we know the user is already logged in
  const [loading, setLoading] = useState(true);

  // ── Restore Session on App Load ────────────────────────────
  // When the app first loads (or page refreshes), check if the
  // user was already logged in by reading localStorage.
  // This runs once on mount (empty dependency array []).

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser  = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Parse the user object back from its JSON string
          const parsedUser = JSON.parse(storedUser);

          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        // If localStorage data is corrupted, clear it cleanly
        console.error("Failed to restore session:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        // Always set loading to false when done
        // (whether we found a session or not)
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // [] = run only once when component mounts

  // ── login() ────────────────────────────────────────────────
  // Call this after a successful login API response.
  //
  // Example in LoginPage.jsx:
  //   const response = await authService.login(email, password);
  //   login(response.data.user, response.data.token);
  //
  // What it does:
  //   1. Saves token + user to localStorage (persists on refresh)
  //   2. Updates the context state (re-renders all consumers)

  const login = (userData, tokenData) => {
    // Persist to localStorage so session survives page refresh
    localStorage.setItem("token",  tokenData);
    localStorage.setItem("user",   JSON.stringify(userData));

    // Update state so components re-render immediately
    setToken(tokenData);
    setUser(userData);
  };

  // ── logout() ───────────────────────────────────────────────
  // Call this when the user clicks logout.
  //
  // What it does:
  //   1. Clears token + user from localStorage
  //   2. Resets context state to null
  //   3. The router will redirect to /login (handled in AppRoutes)

  const logout = () => {
    // Clear everything from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset state — this triggers re-render across all consumers
    setToken(null);
    setUser(null);
  };

  // ── Context Value ──────────────────────────────────────────
  // Everything we expose to the rest of the app

  const value = {
    user,       // current user object (null if not logged in)
    token,      // JWT token string (null if not logged in)
    loading,    // true while restoring session
    login,      // function to log in
    logout,     // function to log out
    isLoggedIn: !!token, // convenient boolean check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────
// useAuthContext — Direct context hook
// Used internally by useAuth.js
// ─────────────────────────────────────────────────────────────

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    // This error means you forgot to wrap your app with <AuthProvider>
    throw new Error("useAuthContext must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;