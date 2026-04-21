const User = require("../models/User");
const { cloudinary } = require("../middleware/uploadMiddleware");

const publicProfile = (user) => ({
  _id:        user._id,
  name:       user.name,
  email:      user.email,
  role:       user.role,
  avatar:     user.avatar,
  bio:        user.bio,
  department: user.department,
  year:       user.year,
  studentId:  user.studentId,
  createdAt:  user.createdAt,
});

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("favourites.users", "name avatar role department")
      .populate("favourites.pages", "name description banner");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -favourites");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user: publicProfile(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (req.body.bio !== undefined) user.bio = req.body.bio;

    if (req.file) {
      // Delete old avatar from Cloudinary if it exists
      if (user.avatar && user.avatar.includes("cloudinary")) {
        const parts   = user.avatar.split("/");
        const pubId   = parts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(pubId).catch(() => {});
      }
      // req.file.path is the Cloudinary secure URL
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id:        updatedUser._id,
        name:       updatedUser.name,
        email:      updatedUser.email,
        role:       updatedUser.role,
        avatar:     updatedUser.avatar,
        bio:        updatedUser.bio,
        department: updatedUser.department,
        year:       updatedUser.year,
        studentId:  updatedUser.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// POST /api/users/favourites/user/:id
const toggleFavouriteUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetId    = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot favourite yourself." });
    }
    const targetUser = await User.findById(targetId).select("_id name avatar");
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    const alreadyFavourited = currentUser.favourites.users
      .map((id) => id.toString())
      .includes(targetId);

    if (alreadyFavourited) {
      currentUser.favourites.users = currentUser.favourites.users.filter(
        (id) => id.toString() !== targetId
      );
    } else {
      currentUser.favourites.users.push(targetId);
    }

    await currentUser.save();
    res.status(200).json({
      message:    alreadyFavourited ? "User removed from favourites." : "User added to favourites.",
      favourited: !alreadyFavourited,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// POST /api/users/favourites/page/:id
const toggleFavouritePage = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetId    = req.params.id;
    const Page        = require("../models/Page");
    const targetPage  = await Page.findById(targetId).select("_id name");
    if (!targetPage) return res.status(404).json({ message: "Page not found." });

    const alreadyFavourited = currentUser.favourites.pages
      .map((id) => id.toString())
      .includes(targetId);

    if (alreadyFavourited) {
      currentUser.favourites.pages = currentUser.favourites.pages.filter(
        (id) => id.toString() !== targetId
      );
    } else {
      currentUser.favourites.pages.push(targetId);
    }

    await currentUser.save();
    res.status(200).json({
      message:    alreadyFavourited ? "Page removed from favourites." : "Page added to favourites.",
      favourited: !alreadyFavourited,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required." });
    }
    const users = await User.find({
      $or: [
        { name:  { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      role: { $ne: "admin" },
    })
      .select("name email avatar role department year")
      .limit(20);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { getMe, getUserById, updateMe, toggleFavouriteUser, toggleFavouritePage, searchUsers };