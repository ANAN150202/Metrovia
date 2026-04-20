import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import { validateLoginForm, hasErrors } from "../utils/validateForm";
import { isAdmin } from "../utils/roleHelpers";

// ─────────────────────────────────────────────────────────────
// LoginPage.jsx — Login Form
//
// Handles login for ALL roles:
//   - Student
//   - Teacher
//   - Admin (same form, no role selector needed)
//
// After successful login:
//   - Saves token + user via AuthContext
//   - Redirects admin → /admin
//   - Redirects student/teacher → /
//
// Rendered inside AuthLayout (dark glass card)
// ─────────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  // ── Form State ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email:    "",
    password: "",
  });

  // Field-level validation errors
  const [errors, setErrors] = useState({
    email:    null,
    password: null,
  });

  // Server-side error (wrong credentials etc.)
  const [serverError, setServerError] = useState(null);

  // Loading state while API call is in progress
  const [loading, setLoading] = useState(false);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // ── Handlers ───────────────────────────────────────────────

  // Update form state and clear the error for that field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error as user types
    setErrors((prev) => ({ ...prev, [name]: null }));
    setServerError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ────────────────────────────
    const validationErrors = validateLoginForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return; // stop if validation fails
    }

    // ── API Call ──────────────────────────────────────────
    setLoading(true);
    setServerError(null);

    try {
      const response = await api.post("/api/auth/login", {
        email:    formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      // Save to AuthContext + localStorage
      login(user, token);

      // Redirect based on role
      if (isAdmin(user)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      // Show the error message from the server
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white font-display mb-2">
          Welcome back
        </h1>
        <p className="text-gray-400 text-sm">
          Sign in to your Metrovia account
        </p>
      </div>

      {/* ── Server Error Banner ─────────────────────────────── */}
      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 animate-fade-in">
          {/* Error icon */}
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      {/* ── Login Form ──────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@university.edu"
            className={`
              w-full px-4 py-3 rounded-xl text-sm
              bg-white/5 border text-white placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-brand-500/50
              transition-all duration-200
              ${errors.email
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-white/10 focus:border-brand-500/50"
              }
            `}
          />
          {/* Field error */}
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`
                w-full px-4 py-3 pr-11 rounded-xl text-sm
                bg-white/5 border text-white placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-brand-500/50
                transition-all duration-200
                ${errors.password
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-brand-500/50"
                }
              `}
            />
            {/* Show/hide password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye-off icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                // Eye icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {/* Field error */}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 px-4 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-brand-600 to-violet-600
            hover:from-brand-500 hover:to-violet-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-glow-sm hover:shadow-glow-md
            active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <>
              {/* Spinner */}
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>

      </form>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-gray-600 text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── Signup Link ─────────────────────────────────────── */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>

    </div>
  );
};

export default LoginPage;