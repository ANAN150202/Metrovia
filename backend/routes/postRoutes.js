// GET /api/posts  POST /api/posts  DELETE /api/posts/:id
const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostsByUser,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const { likePost, unlikePost } = require("../controllers/likeController");
const { addComment, getComments } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");

// All post routes require login

// @route   GET /api/posts
// @desc    Get all home feed posts (newest first)
// @access  Private
router.get("/", protect, getAllPosts);

// @route   GET /api/posts/user/:id
// @desc    Get all posts by a specific user
// @access  Private
// NOTE: defined before /:id to avoid conflict
router.get("/user/:id", protect, getPostsByUser);

// @route   POST /api/posts
// @desc    Create a new post (text + optional image)
// @access  Private
router.post("/", protect, uploadImage.single("image"), createPost);

// @route   PUT /api/posts/:id
// @desc    Edit own post text
// @access  Private
router.put("/:id", protect, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete own post
// @access  Private
router.delete("/:id", protect, deletePost);

// ─── Like routes (nested under posts) ────────────────────────────────────────

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post("/:id/like", protect, likePost);

// @route   DELETE /api/posts/:id/like
// @desc    Unlike a post
// @access  Private
router.delete("/:id/like", protect, unlikePost);

// ─── Comment routes (nested under posts) ─────────────────────────────────────

// @route   GET /api/posts/:id/comments
// @desc    Get all comments for a post
// @access  Private
router.get("/:id/comments", protect, getComments);

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comments", protect, addComment);

module.exports = router;