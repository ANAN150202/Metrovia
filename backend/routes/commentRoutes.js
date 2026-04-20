// GET/POST/DELETE /api/posts/:id/comments
const express = require("express");
const router = express.Router();

const { deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// GET and POST comments are handled in postRoutes.js (nested under /:id/comments)
// This file handles the standalone delete route which needs its own commentId param

// @route   DELETE /api/comments/:commentId
// @desc    Delete own comment by comment ID
// @access  Private
router.delete("/:commentId", protect, deleteComment);

module.exports = router;