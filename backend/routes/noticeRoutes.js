// GET /api/notices  POST /api/notices (admin only)
const express = require("express");
const router = express.Router();

const {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
} = require("../controllers/noticeController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// @route   GET /api/notices
// @desc    Get all notices
// @access  Private (all logged-in users)
router.get("/", protect, getAllNotices);

// @route   GET /api/notices/:id
// @desc    Get a single notice by ID
// @access  Private (all logged-in users)
router.get("/:id", protect, getNoticeById);

// @route   POST /api/notices
// @desc    Create a new notice
// @access  Private (admin only)
router.post("/", protect, authorizeRoles("admin"), createNotice);

// @route   DELETE /api/notices/:id
// @desc    Delete a notice
// @access  Private (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteNotice);

module.exports = router;