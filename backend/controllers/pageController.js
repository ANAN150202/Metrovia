const Page    = require("../models/Page");
const Post    = require("../models/Post");
const Comment = require("../models/Comment");
const User    = require("../models/User");
const fs      = require("fs");
const path    = require("path");

// Populate helper for posts
const populatePost = (query) =>
  query
    .populate("author", "name avatar role department")
    .populate("postedAs", "name avatar")
    .populate({ path: "comments", populate: { path: "author", select: "name avatar" } });

// @route POST /api/pages
const createPage = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Page name is required." });
    }
    const existing = await Page.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: "A page with this name already exists." });

    // Handle both avatar and banner from uploaded files
    // Frontend sends field name "avatar" or "banner"
    const avatarFile = req.files?.avatar?.[0]?.filename || "";
    const bannerFile = req.files?.banner?.[0]?.filename || "";

    const page = await Page.create({
      name:        name.trim(),
      description: description || "",
      owner:       req.user._id,
      avatar:      avatarFile,
      banner:      bannerFile,
      members:     [req.user._id],
    });
    const populated = await page.populate("owner", "name avatar role");
    res.status(201).json({ message: "Page created successfully.", page: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/pages
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 }).populate("owner", "name avatar");
    res.status(200).json({ pages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/pages/search
const searchPages = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required." });
    }
    const pages = await Page.find({ name: { $regex: query, $options: "i" } })
      .select("name description banner avatar members owner")
      .populate("owner", "name avatar")
      .limit(20);
    res.status(200).json({ pages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/pages/:id
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate("owner", "name avatar role")
      .populate("members", "name avatar role");
    if (!page) return res.status(404).json({ message: "Page not found." });
    res.status(200).json({ page });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route PUT /api/pages/:id
const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the page owner can update this page." });
    }

    if (req.body.name && req.body.name.trim() !== "") page.name = req.body.name.trim();
    if (req.body.description !== undefined) page.description = req.body.description;

    // Handle avatar upload
    if (req.files?.avatar?.[0]) {
      if (page.avatar) {
        const old = path.join(__dirname, "../uploads/images", page.avatar);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      page.avatar = req.files.avatar[0].filename;
    }

    // Handle banner upload
    if (req.files?.banner?.[0]) {
      if (page.banner) {
        const old = path.join(__dirname, "../uploads/images", page.banner);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      page.banner = req.files.banner[0].filename;
    }

    const updated   = await page.save();
    const populated = await updated.populate("owner", "name avatar");
    res.status(200).json({ message: "Page updated successfully.", page: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route POST /api/pages/:id/join
const toggleJoinPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Page owner cannot leave their own page." });
    }
    const isMember = page.members.some((id) => id.toString() === req.user._id.toString());
    if (isMember) {
      page.members = page.members.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      page.members.push(req.user._id);
    }
    await page.save();
    res.status(200).json({
      message:     isMember ? "Left the page." : "Joined the page.",
      joined:      !isMember,
      memberCount: page.members.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route POST /api/pages/:id/posts
// Posts are made AS the page (postedAs = page)
const createPagePost = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the page owner can post on this page." });
    }
    const { text } = req.body;
    if (!text && !req.file) {
      return res.status(400).json({ message: "Post must have text or an image." });
    }

    const post = await Post.create({
      author:   req.user._id,   // real author (stored internally)
      postedAs: page._id,       // displayed as this page
      text:     text || "",
      image:    req.file ? req.file.filename : "",
      page:     page._id,
    });

    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ message: "Post created on page.", post: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/pages/:id/posts
const getPagePosts = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    const posts = await populatePost(
      Post.find({ page: req.params.id }).sort({ createdAt: -1 })
    );
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route PUT /api/pages/:id/transfer
// Transfer ownership to another user
const transferOwnership = async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the current owner can transfer ownership." });
    }
    const newOwner = await User.findById(newOwnerId).select("_id name");
    if (!newOwner) return res.status(404).json({ message: "New owner user not found." });

    // Make sure new owner is a member
    const isMember = page.members.some((id) => id.toString() === newOwnerId);
    if (!isMember) page.members.push(newOwnerId);

    page.owner = newOwnerId;
    await page.save();
    res.status(200).json({ message: `Ownership transferred to ${newOwner.name}.` });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = {
  createPage,
  getAllPages,
  searchPages,
  getPageById,
  updatePage,
  toggleJoinPage,
  createPagePost,
  getPagePosts,
  transferOwnership,
};