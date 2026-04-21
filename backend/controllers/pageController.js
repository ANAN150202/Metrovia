const Page    = require("../models/Page");
const Post    = require("../models/Post");
const Comment = require("../models/Comment");
const User    = require("../models/User");
const { cloudinary } = require("../middleware/uploadMiddleware");

const populatePost = (query) =>
  query
    .populate("author", "name avatar role department")
    .populate("postedAs", "name avatar")
    .populate({ path: "comments", populate: { path: "author", select: "name avatar" } });

const createPage = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Page name is required." });
    }
    const existing = await Page.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: "A page with this name already exists." });

    // Cloudinary returns req.file.path as the URL for single upload
    // For fields() upload, files are in req.files
    const avatarUrl = req.files?.avatar?.[0]?.path || "";
    const bannerUrl = req.files?.banner?.[0]?.path || "";

    const page = await Page.create({
      name:        name.trim(),
      description: description || "",
      owner:       req.user._id,
      avatar:      avatarUrl,
      banner:      bannerUrl,
      members:     [req.user._id],
    });
    const populated = await page.populate("owner", "name avatar role");
    res.status(201).json({ message: "Page created successfully.", page: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 }).populate("owner", "name avatar");
    res.status(200).json({ pages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

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

const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the page owner can update this page." });
    }

    if (req.body.name && req.body.name.trim() !== "") page.name = req.body.name.trim();
    if (req.body.description !== undefined) page.description = req.body.description;

    if (req.files?.avatar?.[0]) {
      if (page.avatar && page.avatar.includes("cloudinary")) {
        const parts = page.avatar.split("/");
        const pubId = parts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(pubId).catch(() => {});
      }
      page.avatar = req.files.avatar[0].path;
    }

    if (req.files?.banner?.[0]) {
      if (page.banner && page.banner.includes("cloudinary")) {
        const parts = page.banner.split("/");
        const pubId = parts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(pubId).catch(() => {});
      }
      page.banner = req.files.banner[0].path;
    }

    const updated   = await page.save();
    const populated = await updated.populate("owner", "name avatar");
    res.status(200).json({ message: "Page updated successfully.", page: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

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
    res.status(200).json({ message: isMember ? "Left the page." : "Joined the page.", joined: !isMember, memberCount: page.members.length });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

const createPagePost = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the page owner can post on this page." });
    }
    const { text } = req.body;
    if (!text && !req.file) return res.status(400).json({ message: "Post must have text or an image." });

    const post = await Post.create({
      author:   req.user._id,
      postedAs: page._id,
      text:     text || "",
      image:    req.file ? req.file.path : "", // Cloudinary URL
      page:     page._id,
    });
    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ message: "Post created on page.", post: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

const getPagePosts = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found." });
    const posts = await populatePost(Post.find({ page: req.params.id }).sort({ createdAt: -1 }));
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

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
    const isMember = page.members.some((id) => id.toString() === newOwnerId);
    if (!isMember) page.members.push(newOwnerId);
    page.owner = newOwnerId;
    await page.save();
    res.status(200).json({ message: `Ownership transferred to ${newOwner.name}.` });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { createPage, getAllPages, searchPages, getPageById, updatePage, toggleJoinPage, createPagePost, getPagePosts, transferOwnership };