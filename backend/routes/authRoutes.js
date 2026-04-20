// POST /api/auth/signup  POST /api/auth/login  POST /api/auth/logout
const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// @route   POST /api/auth/signup
// @desc    Register a new student or teacher
// @access  Public
router.post("/signup", signup);

// @route   POST /api/auth/login
// @desc    Login for students, teachers, and admin
// @access  Public
router.post("/login", login);

module.exports = router;