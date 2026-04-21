const Post    = require("../models/Post");
const Comment = require("../models/Comment");
const Page    = require("../models/Page");
const { cloudinary } = require("../middleware/uploadMiddleware");

const populatePost = (query) =>
  query
    .populate("author", "name avatar role department")
    .populate("postedAs", "name avatar")
    .populate({ path: "comments", populate: { path: "author", select: "name avatar" } });

// POST /api/posts
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text && !req.file) {
      return res.status(400).json({ message: "Post must have text or an image." });
    }
    const post = await Post.create({
      author: req.user._id,
      text:   text || "",
      image:  req.file ? req.file.path : "", // Cloudinary URL
    });
    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ message: "Post created successfully.", post: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// GET /api/posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await populatePost(Post.find().sort({ createdAt: -1 }));
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// GET /api/posts/user/:id
const getPostsByUser = async (req, res) => {
  try {
    const posts = await populatePost(
      Post.find({ author: req.params.id, postedAs: null }).sort({ createdAt: -1 })
    );
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const isAuthor    = post.author.toString() === req.user._id.toString();
    let   isPageOwner = false;
    if (post.page) {
      const page = await Page.findById(post.page);
      isPageOwner = page?.owner.toString() === req.user._id.toString();
    }
    if (!isAuthor && !isPageOwner) {
      return res.status(403).json({ message: "You can only edit your own posts." });
    }

    if (req.body.text !== undefined) post.text = req.body.text;
    const updated   = await post.save();
    const populated = await populatePost(Post.findById(updated._id));
    res.status(200).json({ message: "Post updated successfully.", post: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const isAuthor    = post.author.toString() === req.user._id.toString();
    let   isPageOwner = false;
    if (post.page) {
      const page = await Page.findById(post.page);
      isPageOwner = page?.owner.toString() === req.user._id.toString();
    }
    if (!isAuthor && !isPageOwner) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    // Delete image from Cloudinary if it exists
    if (post.image && post.image.includes("cloudinary")) {
      const parts = post.image.split("/");
      const pubId = parts.slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(pubId).catch(() => {});
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { createPost, getAllPosts, getPostsByUser, updatePost, deletePost };