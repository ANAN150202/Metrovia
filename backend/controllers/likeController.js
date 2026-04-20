// Handles like and unlike a post
const Post = require("../models/Post");

// ─── @route   POST /api/posts/:id/like ───────────────────────────────────────
// ─── @desc    Like a post (prevents duplicate likes from the same user)
// ─── @access  Private

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if this user has already liked the post
    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ message: "You have already liked this post." });
    }

    // Add the user's ID to the likes array
    post.likes.push(req.user._id);
    await post.save();

    res.status(200).json({
      message: "Post liked.",
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   DELETE /api/posts/:id/like ─────────────────────────────────────
// ─── @desc    Unlike a post
// ─── @access  Private

const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if this user has actually liked the post before
    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!alreadyLiked) {
      return res.status(400).json({ message: "You have not liked this post." });
    }

    // Remove the user's ID from the likes array
    post.likes = post.likes.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await post.save();

    res.status(200).json({
      message: "Post unliked.",
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { likePost, unlikePost };