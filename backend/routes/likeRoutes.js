// POST /api/posts/:id/like
const express = require("express");
const router = express.Router();

const { likePost, unlikePost } = require("../controllers/likeController");
const { protect } = require("../middleware/authMiddleware");

// These routes are also mounted directly in postRoutes.js
// This file exists for standalone use if needed in the future

// @route   POST /api/likes/:id
// @desc    Like a post
// @access  Private
router.post("/:id", protect, likePost);

// @route   DELETE /api/likes/:id
// @desc    Unlike a post
// @access  Private
router.delete("/:id", protect, unlikePost);

module.exports = router;