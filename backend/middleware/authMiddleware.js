// Verifies JWT token on protected routes
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protects private routes by verifying the JWT token
// Attaches the logged-in user object to req.user
const protect = async (req, res, next) => {
  try {
    // Check if Authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify the token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the decoded token payload
    // Exclude the password field from the result
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized. User not found." });
    }

    // Attach user to request so controllers can access it
    req.user = user;

    next();
  } catch (error) {
    // Handles expired or invalid tokens
    return res.status(401).json({ message: "Not authorized. Invalid or expired token." });
  }
};

module.exports = { protect };