// Custom hook to access AuthContext easily
import { useAuthContext } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
// useAuth.js — Custom Hook for Authentication
//
// A clean shortcut to access the AuthContext.
// Instead of importing useContext + AuthContext every time,
// just import this one hook.
//
// Usage in any component:
//   import useAuth from "../hooks/useAuth";
//
//   const { user, token, login, logout, loading, isLoggedIn } = useAuth();
//
// Available values:
//   user       → { _id, name, email, role, avatar, bio, ... } or null
//   token      → JWT string or null
//   loading    → true while restoring session on app load
//   isLoggedIn → boolean shortcut (true if token exists)
//   login()    → login(userData, tokenData)
//   logout()   → clears session and state
// ─────────────────────────────────────────────────────────────

const useAuth = () => {
  // Simply delegates to the context hook
  // All logic lives in AuthContext.jsx
  return useAuthContext();
};

export default useAuth;