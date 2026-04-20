// Form validation helper functions
// ─────────────────────────────────────────────────────────────
// validateForm.js — Form Validation Helpers
//
// Reusable validation functions used in:
//   - LoginPage.jsx
//   - SignupPage.jsx
//   - ProfilePage.jsx (bio update)
//   - Any form that needs client-side validation
//
// Each function returns:
//   - null    → no error (valid)
//   - string  → error message to show the user
//
// Usage:
//   const error = validateEmail(email);
//   if (error) setEmailError(error);
// ─────────────────────────────────────────────────────────────


// ── validateEmail() ──────────────────────────────────────────
// Checks if the email is a valid format.
//
// Returns: null (valid) or error string

export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Email is required.";
  }

  // Standard email regex — covers most real cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  return null; // valid
};


// ── validatePassword() ───────────────────────────────────────
// Checks if a password meets minimum requirements.
//
// Rules:
//   - Required
//   - Minimum 6 characters
//
// Returns: null (valid) or error string

export const validatePassword = (password) => {
  if (!password || password === "") {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null; // valid
};


// ── validateConfirmPassword() ────────────────────────────────
// Checks if two password fields match.
// Used on signup page.
//
// Returns: null (valid) or error string

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword === "") {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null; // valid
};


// ── validateRequired() ───────────────────────────────────────
// Checks that a field is not empty.
// Works for any required text field (name, title, etc.)
//
// Usage:
//   validateRequired("", "Name")   → "Name is required."
//   validateRequired("John", "Name") → null
//
// Returns: null (valid) or error string

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.toString().trim() === "") {
    return `${fieldName} is required.`;
  }

  return null; // valid
};


// ── validateName() ───────────────────────────────────────────
// Checks if a name is valid (non-empty, reasonable length).
//
// Returns: null (valid) or error string

export const validateName = (name) => {
  const requiredError = validateRequired(name, "Name");
  if (requiredError) return requiredError;

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (name.trim().length > 50) {
    return "Name must not exceed 50 characters.";
  }

  return null; // valid
};


// ── validateBio() ────────────────────────────────────────────
// Checks if a bio is within the allowed character limit.
// Bio is optional but has a max length.
//
// Returns: null (valid) or error string

export const validateBio = (bio) => {
  if (!bio) return null; // bio is optional

  if (bio.length > 300) {
    return "Bio must not exceed 300 characters.";
  }

  return null; // valid
};


// ── validateLoginForm() ──────────────────────────────────────
// Validates the entire login form at once.
// Returns an object with field-level errors.
//
// Usage:
//   const errors = validateLoginForm({ email, password });
//   if (errors.email) setEmailError(errors.email);
//
// Returns: { email, password } — each is null or error string

export const validateLoginForm = ({ email, password }) => {
  return {
    email:    validateEmail(email),
    password: validatePassword(password),
  };
};


// ── validateSignupForm() ─────────────────────────────────────
// Validates the entire signup form at once.
//
// Returns: { name, email, password, confirmPassword, role }
// Each value is null (valid) or an error string.

export const validateSignupForm = ({ name, email, password, confirmPassword, role }) => {
  return {
    name:            validateName(name),
    email:           validateEmail(email),
    password:        validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
    role:            validateRequired(role, "Role"),
  };
};


// ── hasErrors() ──────────────────────────────────────────────
// Checks if a validation result object has any errors.
// Pass the result from validateLoginForm / validateSignupForm.
//
// Usage:
//   const errors = validateSignupForm(formData);
//   if (hasErrors(errors)) return; // stop submission
//
// Returns: true if there are any errors, false if all valid

export const hasErrors = (errorsObject) => {
  return Object.values(errorsObject).some((error) => error !== null);
};