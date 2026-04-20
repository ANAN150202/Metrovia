/*const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
//app.use(cors({
  //origin: process.env.CLIENT_URL || "http://localhost:5173",
  //credentials: true,
//}));

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CampusConnect API is running" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/posts",    require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

app.use("/api/messages", require("./routes/messageRoutes"));

app.use("/api/pages",   require("./routes/pageRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

app.use("/api/academic", require("./routes/academicRoutes"));
app.use("/api/admin",    require("./routes/adminRoutes"));
// app.use("/api/users",    require("./routes/userRoutes"));
// app.use("/api/posts",    require("./routes/postRoutes"));
// app.use("/api/messages", require("./routes/messageRoutes"));
// app.use("/api/pages",    require("./routes/pageRoutes"));
// app.use("/api/notices",  require("./routes/noticeRoutes"));
// app.use("/api/academic", require("./routes/academicRoutes"));
// app.use("/api/admin",    require("./routes/adminRoutes"));

// Global error handler — must be last
app.use(require("./middleware/errorMiddleware"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/
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