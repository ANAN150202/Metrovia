// Handles get and update user profile
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// ─── Helper: build safe public profile (no password) ─────────────────────────

const publicProfile = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  department: user.department,
  year: user.year,
  studentId: user.studentId,
  createdAt: user.createdAt,
});

// ─── @route   GET /api/users/me ───────────────────────────────────────────────
// ─── @desc    Get the currently logged-in user's full profile
// ─── @access  Private

const getMe = async (req, res) => {
  try {
    // req.user is attached by authMiddleware — already excludes password
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("favourites.users", "name avatar role department")
      .populate("favourites.pages", "name description banner");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/users/:id ─────────────────────────────────────────────
// ─── @desc    Get another user's public profile by ID
// ─── @access  Private (must be logged in, but any user can view any profile)

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -favourites");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return only safe public fields
    res.status(200).json({ user: publicProfile(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   PUT /api/users/me ──────────────────────────────────────────────
// ─── @desc    Update logged-in user's bio and/or profile picture
// ─── @access  Private

const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Only bio is updatable via text fields
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    // If a new avatar image was uploaded via multer, update the filename
    if (req.file) {
      // Delete the old avatar file from disk if it exists
      if (user.avatar) {
        const oldPath = path.join(__dirname, "../uploads/images", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Save just the filename — full URL is built on the frontend
      user.avatar = req.file.filename;
    }

    // Explicitly block any attempt to change identity fields
    // These are silently ignored even if sent in the request body
    const blockedFields = [
      "name", "email", "password", "role",
      "studentId", "department", "year",
    ];
    blockedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Do nothing — field is ignored
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        department: updatedUser.department,
        year: updatedUser.year,
        studentId: updatedUser.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   POST /api/users/favourites/user/:id ────────────────────────────
// ─── @desc    Toggle favourite a user (add if not present, remove if already there)
// ─── @access  Private

const toggleFavouriteUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetId = req.params.id;

    // Prevent favouriting yourself
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot favourite yourself." });
    }

    // Check the target user actually exists
    const targetUser = await User.findById(targetId).select("_id name avatar");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const favouriteUsers = currentUser.favourites.users.map((id) => id.toString());
    const alreadyFavourited = favouriteUsers.includes(targetId);

    if (alreadyFavourited) {
      // Remove from favourites
      currentUser.favourites.users = currentUser.favourites.users.filter(
        (id) => id.toString() !== targetId
      );
    } else {
      // Add to favourites
      currentUser.favourites.users.push(targetId);
    }

    await currentUser.save();

    res.status(200).json({
      message: alreadyFavourited ? "User removed from favourites." : "User added to favourites.",
      favourited: !alreadyFavourited,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   POST /api/users/favourites/page/:id ────────────────────────────
// ─── @desc    Toggle favourite a page (add if not present, remove if already there)
// ─── @access  Private

const toggleFavouritePage = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetId = req.params.id;

    // Check the target page actually exists
    const Page = require("../models/Page");
    const targetPage = await Page.findById(targetId).select("_id name");
    if (!targetPage) {
      return res.status(404).json({ message: "Page not found." });
    }

    const favouritePages = currentUser.favourites.pages.map((id) => id.toString());
    const alreadyFavourited = favouritePages.includes(targetId);

    if (alreadyFavourited) {
      // Remove from favourites
      currentUser.favourites.pages = currentUser.favourites.pages.filter(
        (id) => id.toString() !== targetId
      );
    } else {
      // Add to favourites
      currentUser.favourites.pages.push(targetId);
    }

    await currentUser.save();

    res.status(200).json({
      message: alreadyFavourited ? "Page removed from favourites." : "Page added to favourites.",
      favourited: !alreadyFavourited,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/users/search?q=query ──────────────────────────────────
// ─── @desc    Search users by name or email
// ─── @access  Private

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Case-insensitive search on name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      // Exclude admin from search results
      role: { $ne: "admin" },
    })
      .select("name email avatar role department year")
      .limit(20);

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = {
  getMe,
  getUserById,
  updateMe,
  toggleFavouriteUser,
  toggleFavouritePage,
  searchUsers,
};