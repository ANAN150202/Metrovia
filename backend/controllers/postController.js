const Post    = require("../models/Post");
const Comment = require("../models/Comment");
const Page    = require("../models/Page");
const fs      = require("fs");
const path    = require("path");

// Populate helper
const populatePost = (query) =>
  query
    .populate("author", "name avatar role department")
    .populate("postedAs", "name avatar")
    .populate({
      path: "comments",
      populate: { path: "author", select: "name avatar" },
    });

// @route POST /api/posts
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text && !req.file) {
      return res.status(400).json({ message: "Post must have text or an image." });
    }
    const post      = await Post.create({
      author: req.user._id,
      text:   text || "",
      image:  req.file ? req.file.filename : "",
    });
    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ message: "Post created successfully.", post: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await populatePost(Post.find().sort({ createdAt: -1 }));
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// @route GET /api/posts/user/:id
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

// @route PUT /api/posts/:id
// Author OR page owner can edit a page post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const isAuthor = post.author.toString() === req.user._id.toString();

    // If it's a page post, also allow the page owner to edit
    let isPageOwner = false;
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

// @route DELETE /api/posts/:id
// Author OR page owner can delete a page post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const isAuthor = post.author.toString() === req.user._id.toString();

    // If it's a page post, also allow the page owner to delete
    let isPageOwner = false;
    if (post.page) {
      const page = await Page.findById(post.page);
      isPageOwner = page?.owner.toString() === req.user._id.toString();
    }

    if (!isAuthor && !isPageOwner) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    if (post.image) {
      const imagePath = path.join(__dirname, "../uploads/images", post.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { createPost, getAllPosts, getPostsByUser, updatePost, deletePost };