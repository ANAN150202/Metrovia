import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useState, useEffect, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────
// ThemeContext — provides dark mode toggle to the whole app
// Any component can call useTheme() to get isDark + toggleTheme
// ─────────────────────────────────────────────────────────────

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

// ─────────────────────────────────────────────────────────────
// App.jsx — Root Component
//
// Provider order (outermost to innermost):
//   ThemeContext    → dark mode class on <html>
//   BrowserRouter   → React Router
//   AuthProvider    → auth state
//   AppRoutes       → page rendering
// ─────────────────────────────────────────────────────────────

const App = () => {
  // Read saved preference from localStorage, default to light mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("metrovia-theme");
    return saved === "dark";
  });

  // Apply or remove "dark" class on <html> whenever isDark changes
  // Tailwind reads this class to activate all dark: variants
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("metrovia-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;