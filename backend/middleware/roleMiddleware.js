// Restricts routes by role: student / teacher / admin
// Restricts a route to only specific roles
// Usage: authorizeRoles("admin") or authorizeRoles("student", "teacher")
// Must be used AFTER the protect middleware (req.user must exist)

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the logged-in user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(" or ")} can perform this action.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };