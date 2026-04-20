// GET /api/users/:id  PUT /api/users/:id
const express = require("express");
const router = express.Router();

const {
  getMe,
  getUserById,
  updateMe,
  toggleFavouriteUser,
  toggleFavouritePage,
  searchUsers,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");

// All user routes are protected — must be logged in

// @route   GET /api/users/search?q=query
// @desc    Search users by name or email
// @access  Private
// NOTE: must be defined before /:id to avoid "search" being treated as an ID
router.get("/search", protect, searchUsers);

// @route   GET /api/users/me
// @desc    Get current logged-in user's full profile (with favourites)
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/users/me
// @desc    Update bio and/or profile picture
// @access  Private
// uploadImage.single("avatar") handles the file upload from form-data
router.put("/me", protect, uploadImage.single("avatar"), updateMe);

// @route   POST /api/users/favourites/user/:id
// @desc    Toggle favourite a user by ID
// @access  Private
router.post("/favourites/user/:id", protect, toggleFavouriteUser);

// @route   POST /api/users/favourites/page/:id
// @desc    Toggle favourite a page by ID
// @access  Private
router.post("/favourites/page/:id", protect, toggleFavouritePage);

// @route   GET /api/users/:id
// @desc    Get any user's public profile by ID
// @access  Private
// NOTE: keep this LAST so specific paths above are matched first
router.get("/:id", protect, getUserById);

module.exports = router;