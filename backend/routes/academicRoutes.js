// GET /api/academic/:type  (type = routine | result | seatplan)
const express = require("express");
const router = express.Router();

const { getRoutine, getResult, getSeatPlan } = require("../controllers/academicController");
const { protect } = require("../middleware/authMiddleware");

// All academic routes require login
// These are read-only — only admin can upload (handled in adminRoutes)

// @route   GET /api/academic/routine
// @desc    Get latest Routine PDF info and URL
// @access  Private
router.get("/routine", protect, getRoutine);

// @route   GET /api/academic/result
// @desc    Get latest Result PDF info and URL
// @access  Private
router.get("/result", protect, getResult);

// @route   GET /api/academic/seatplan
// @desc    Get latest Seat Plan PDF info and URL
// @access  Private
router.get("/seatplan", protect, getSeatPlan);

module.exports = router;