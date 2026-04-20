const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: generate JWT token ───────────────────────────────────────────────

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── @route   POST /api/auth/signup ──────────────────────────────────────────
// ─── @desc    Register a new student or teacher
// ─── @access  Public

const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, year, studentId } = req.body;

    // Basic field validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    // Only student and teacher can sign up — admin is hardcoded
    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be created via signup." });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Role must be either student or teacher." });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || "",
      year: year || "",
      studentId: studentId || "",
    });

    // Respond with user info and token
    res.status(201).json({
      message: "Account created successfully.",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        department: user.department,
        year: user.year,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error during signup." });
  }
};

// ─── @route   POST /api/auth/login ───────────────────────────────────────────
// ─── @desc    Login for students, teachers, and admin
// ─── @access  Public

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // ── Admin login (hardcoded credentials) ──────────────────────────────────
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@uni.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email === adminEmail) {
      // Check admin password (plain text comparison for hardcoded admin)
      if (password !== adminPassword) {
        return res.status(401).json({ message: "Invalid admin credentials." });
      }

      // Find or create the admin user record in the DB
      // This ensures admin has a real _id for references (notices, uploads, etc.)
      let adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        // First-time: seed the admin into the database
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(adminPassword, salt);

        adminUser = await User.create({
          name: "Admin",
          email: adminEmail,
          password: hashed,
          role: "admin",
        });
      }

      return res.status(200).json({
        message: "Admin login successful.",
        token: generateToken(adminUser._id),
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          avatar: adminUser.avatar,
          bio: adminUser.bio,
        },
      });
    }

    // ── Student / Teacher login ───────────────────────────────────────────────

    // Look up the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare submitted password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Respond with user info and token
    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        department: user.department,
        year: user.year,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error during login." });
  }
};

module.exports = { signup, login };