// All React Router routes with protected route logic
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { isAdmin } from "../utils/roleHelpers";

// ── Page imports ──────────────────────────────────────────────
// These pages will be created in later steps.
// We use lazy loading pattern here for performance,
// but import directly for simplicity at this stage.

import LoginPage    from "../pages/LoginPage";
import SignupPage   from "../pages/SignupPage";

// Main app pages (created in later steps)
import HomePage        from "../pages/HomePage";
import ProfilePage     from "../pages/ProfilePage";
import MessagesPage    from "../pages/MessagesPage";
import PagesPage       from "../pages/PagesPage";
import SinglePageView  from "../pages/SinglePageView";
import AcademicPage    from "../pages/AcademicPage";
import RoutinePage     from "../pages/RoutinePage";
import ResultPage      from "../pages/ResultPage";
import SeatPlanPage    from "../pages/SeatPlanPage";
import NoticePage      from "../pages/NoticePage";
import AdminDashboard  from "../pages/AdminDashboard";

// Layouts (created in later steps)
import MainLayout  from "../layouts/MainLayout";
import AuthLayout  from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

// ─────────────────────────────────────────────────────────────
// Route Guard Components
//
// These components protect routes based on auth state.
// They render either the intended page or a redirect.
// ─────────────────────────────────────────────────────────────

// ── ProtectedRoute ────────────────────────────────────────────
// Blocks access to any route that requires login.
// If not logged in → redirect to /login
// If logged in as admin → redirect to /admin (admins use dashboard)
// If logged in as student/teacher → render the page

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  // While restoring session from localStorage, show nothing
  // This prevents a brief flash of the login page on refresh
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin should not access regular user pages
  // Redirect them to their dashboard
  if (isAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }

  // All good — render the requested page
  return children;
};

// ── AdminRoute ────────────────────────────────────────────────
// Blocks access to admin-only routes.
// If not logged in → redirect to /login
// If logged in but not admin → redirect to /
// If admin → render the page

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → go to home
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  // Admin confirmed — render the page
  return children;
};

// ── GuestRoute ────────────────────────────────────────────────
// For pages that should ONLY be visible when NOT logged in.
// (Login page, Signup page)
// If already logged in → redirect to appropriate home

const GuestRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in — redirect based on role
  if (token && user) {
    if (isAdmin(user)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Not logged in — show the guest page (login/signup)
  return children;
};

// ─────────────────────────────────────────────────────────────
// AppRoutes — Main Route Definitions
//
// Route structure:
//
//   /login        → LoginPage    (guest only)
//   /signup       → SignupPage   (guest only)
//
//   /             → HomePage     (protected — student/teacher)
//   /profile/:id  → ProfilePage  (protected)
//   /messages     → MessagesPage (protected)
//   /pages        → PagesPage    (protected)
//   /pages/:id    → SinglePageView (protected)
//   /academic     → AcademicPage (protected)
//   /academic/routine   → RoutinePage  (protected)
//   /academic/result    → ResultPage   (protected)
//   /academic/seatplan  → SeatPlanPage (protected)
//   /notices      → NoticePage   (protected)
//
//   /admin        → AdminDashboard (admin only)
//
//   *             → redirect to /  (catch-all 404 handling)
// ─────────────────────────────────────────────────────────────

const AppRoutes = () => {
  return (
    <Routes>

      {/* ── Guest Routes (login/signup) ─────────────────────
          Wrapped in AuthLayout — centered auth design
          Redirects to home if already logged in
      ──────────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          </GuestRoute>
        }
      />

      {/* ── Protected Routes (student/teacher) ─────────────
          Wrapped in MainLayout — navbar + sidebar + content
          Redirects to /login if not authenticated
          Redirects to /admin if user is admin
      ──────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MessagesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pages"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PagesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pages/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SinglePageView />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AcademicPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic/routine"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoutinePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic/result"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ResultPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic/seatplan"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SeatPlanPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NoticePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Admin Routes ────────────────────────────────────
          Wrapped in AdminLayout — clean dashboard layout
          Only accessible by role === "admin"
      ──────────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* ── Catch-all / 404 ─────────────────────────────────
          Any unknown URL redirects to home.
          Home itself is protected, so unauthenticated users
          will be redirected to /login automatically.
      ──────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;