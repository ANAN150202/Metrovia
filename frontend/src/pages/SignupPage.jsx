import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import { validateSignupForm, hasErrors } from "../utils/validateForm";

// ─────────────────────────────────────────────────────────────
// SignupPage.jsx — Registration Form
//
// Allows Student and Teacher signup only.
// Admin cannot sign up (blocked on backend too).
//
// Fields:
//   - Name (required)
//   - Email (required)
//   - Password (required, min 6 chars)
//   - Confirm Password (must match)
//   - Role: student / teacher (required)
//   - Department (optional)
//   - Year (optional, students only)
//   - Student ID (optional)
//
// After successful signup:
//   - Auto login (saves token + user)
//   - Redirects to /
//
// Rendered inside AuthLayout (dark glass card)
// ─────────────────────────────────────────────────────────────

const SignupPage = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  // ── Form State ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    role:            "",       // "student" or "teacher"
    department:      "",
    year:            "",
    studentId:       "",
  });

  // Field-level validation errors
  const [errors, setErrors] = useState({});

  // Server error message
  const [serverError, setServerError] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Handlers ───────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error as user types
    setErrors((prev) => ({ ...prev, [name]: null }));
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ────────────────────────────
    const validationErrors = validateSignupForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    // ── API Call ──────────────────────────────────────────
    setLoading(true);
    setServerError(null);

    try {
      const response = await api.post("/api/auth/signup", {
        name:       formData.name.trim(),
        email:      formData.email.trim(),
        password:   formData.password,
        role:       formData.role,
        department: formData.department.trim(),
        year:       formData.year.trim(),
        studentId:  formData.studentId.trim(),
      });

      const { token, user } = response.data;

      // Auto login after signup
      login(user, token);

      // Redirect to home feed
      navigate("/", { replace: true });

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Reusable input class builder ───────────────────────────
  // Returns the correct border/ring color based on error state
  const inputClass = (fieldName) => `
    w-full px-4 py-3 rounded-xl text-sm
    bg-white/5 border text-white placeholder-gray-600
    focus:outline-none focus:ring-2 focus:ring-brand-500/50
    transition-all duration-200
    ${errors[fieldName]
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-brand-500/50"
    }
  `;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-white font-display mb-2">
          Create an account
        </h1>
        <p className="text-gray-400 text-sm">
          Join Metrovia — it only takes a minute
        </p>
      </div>

      {/* ── Server Error ────────────────────────────────────── */}
      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 animate-fade-in">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      {/* ── Signup Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            className={inputClass("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
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
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Role selector — student or teacher only */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1.5">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["student", "teacher"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role: r }));
                  setErrors((prev) => ({ ...prev, role: null }));
                }}
                className={`
                  py-3 px-4 rounded-xl border text-sm font-medium
                  transition-all duration-200 capitalize
                  ${formData.role === r
                    ? "bg-brand-600/20 border-brand-500/50 text-brand-300 shadow-glow-sm"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                  }
                `}
              >
                {/* Icon */}
                {r === "student" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Student
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Teacher
                  </span>
                )}
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1.5 text-xs text-red-400">{errors.role}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={inputClass("password") + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className={inputClass("confirmPassword") + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* ── Optional Identity Fields ──────────────────────── */}
        {/* Shown as a collapsible "optional" section */}
        <div
          className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4"
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Optional details
          </p>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-400 mb-1.5">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              className={inputClass("department")}
            />
          </div>

          {/* Year — shown for students, still visible for teachers */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-400 mb-1.5">
              Year / Batch
            </label>
            <input
              id="year"
              name="year"
              type="text"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 3rd Year / 2021"
              className={inputClass("year")}
            />
          </div>

          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-400 mb-1.5">
              Student / Faculty ID
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. CSE-2021-045"
              className={inputClass("studentId")}
            />
          </div>
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
            mt-2
          "
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>

      </form>

      {/* ── Login Link ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-gray-600 text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>

    </div>
  );
};

export default SignupPage;