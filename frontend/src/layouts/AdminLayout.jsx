import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Logo from "../components/common/Logo";

// ─────────────────────────────────────────────────────────────
// AdminLayout.jsx — Admin Dashboard Layout (Metrovia)
// ─────────────────────────────────────────────────────────────

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* ── Admin Top Bar ─────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b"
        style={{
          background:           "rgba(15, 15, 20, 0.95)",
          borderColor:          "rgba(59, 130, 246, 0.12)",
          backdropFilter:       "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Left — Metrovia logo + Admin badge */}
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="full" />
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Admin
          </span>
        </div>

        {/* Right — Admin info + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <span className="text-gray-300 text-sm font-medium">
              {user?.name || "Admin"}
            </span>
          </div>
          <div className="w-px h-5 bg-dark-border hidden sm:block" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────── */}
      <main className="flex-1 pt-16">
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)" }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-dark-border py-4 text-center">
        <p className="text-gray-600 text-xs">
          Metrovia Admin Panel · {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
};

export default AdminLayout;