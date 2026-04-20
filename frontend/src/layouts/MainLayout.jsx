import Navbar     from "../components/common/Navbar";
import Sidebar    from "../components/common/Sidebar";
import RightPanel from "../components/common/RightPanel";

// ─────────────────────────────────────────────────────────────
// MainLayout.jsx — Main Application Layout (Final Version)
//
// Used for all protected pages (home, profile, messages, etc.)
//
// Layout structure:
//
//   ┌─────────────────────────────────────────────────────┐
//   │                  Navbar (fixed top)                 │
//   ├──────────────┬──────────────────────┬───────────────┤
//   │              │                      │               │
//   │   Sidebar    │    Main Content      │  RightPanel   │
//   │  (fixed left)│    (children)        │ (fixed right) │
//   │   lg:block   │                      │   xl:block    │
//   │              │                      │               │
//   └──────────────┴──────────────────────┴───────────────┘
//
// Responsive breakpoints:
//   Mobile  (< 1024px): Navbar only, single column content
//   Tablet  (< 1280px): Navbar + Sidebar, no RightPanel
//   Desktop (≥ 1280px): Full 3-column layout
// ─────────────────────────────────────────────────────────────

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-light-panel dark:bg-[#0F0F0F] flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* ── Main Row ───────────────────────────────────────── */}
      <div className="flex flex-1 pt-16">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className="fixed top-16 left-0 bottom-0 z-40 hidden lg:block">
          <Sidebar />
        </div>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="flex-1 lg:ml-64 xl:mr-72 min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>

        {/* ── Right Panel ──────────────────────────────────── */}
        <div className="fixed top-16 right-0 bottom-0 z-40 hidden xl:block">
          <RightPanel />
        </div>

      </div>
    </div>
  );
};

export default MainLayout;