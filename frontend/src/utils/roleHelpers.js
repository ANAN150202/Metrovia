// Helper functions to check and compare user roles
// ─────────────────────────────────────────────────────────────
// roleHelpers.js — User Role Utility Functions
//
// Simple helpers to check what role a user has.
// Used in:
//   - AppRoutes.jsx  (protect admin routes)
//   - Navbar.jsx     (show/hide admin link)
//   - Components     (conditional rendering by role)
//
// Usage:
//   import { isAdmin, isStudent, isTeacher } from "../utils/roleHelpers";
//
//   if (isAdmin(user)) { ... }
// ─────────────────────────────────────────────────────────────


// ── isAdmin() ────────────────────────────────────────────────
// Returns true if the user is an admin.
// Admin has access to the dashboard, PDF uploads, notices.
//
// Usage:
//   isAdmin(user)  → true / false

export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === "admin";
};


// ── isStudent() ──────────────────────────────────────────────
// Returns true if the user is a student.
//
// Usage:
//   isStudent(user)  → true / false

export const isStudent = (user) => {
  if (!user) return false;
  return user.role === "student";
};


// ── isTeacher() ──────────────────────────────────────────────
// Returns true if the user is a teacher.
//
// Usage:
//   isTeacher(user)  → true / false

export const isTeacher = (user) => {
  if (!user) return false;
  return user.role === "teacher";
};


// ── isUser() ─────────────────────────────────────────────────
// Returns true if the user is either a student or teacher.
// Useful for routes/features that both roles can access
// but admin cannot (or shouldn't by default).
//
// Usage:
//   isUser(user)  → true / false

export const isUser = (user) => {
  if (!user) return false;
  return user.role === "student" || user.role === "teacher";
};


// ── getRole() ────────────────────────────────────────────────
// Returns the role as a formatted display string.
//
// Usage:
//   getRole(user)  → "Student" / "Teacher" / "Admin" / "Guest"

export const getRole = (user) => {
  if (!user || !user.role) return "Guest";

  const roles = {
    student: "Student",
    teacher: "Teacher",
    admin:   "Admin",
  };

  return roles[user.role] || "Guest";
};


// ── getRoleColor() ───────────────────────────────────────────
// Returns a Tailwind color class based on the user's role.
// Used to color role badges in the UI.
//
// Usage:
//   <span className={getRoleColor(user)}>Student</span>

export const getRoleColor = (user) => {
  if (!user) return "text-gray-500";

  const colors = {
    student: "text-brand-500",
    teacher: "text-violet-500",
    admin:   "text-amber-500",
  };

  return colors[user.role] || "text-gray-500";
};