// Handles add, fetch, and delete comments
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ─── @route   POST /api/posts/:id/comments ───────────────────────────────────
// ─── @desc    Add a comment to a post
// ─── @access  Private

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    // Verify the post exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Create the comment
    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text: text.trim(),
    });

    // Add the comment reference to the post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate author info before returning
    const populated = await comment.populate("author", "name avatar role");

    res.status(201).json({
      message: "Comment added.",
      comment: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/posts/:id/comments ────────────────────────────────────
// ─── @desc    Fetch all comments for a post (oldest first)
// ─── @access  Private

const getComments = async (req, res) => {
  try {
    // Verify the post exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 }) // oldest first for natural reading order
      .populate("author", "name avatar role");

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   DELETE /api/comments/:commentId ────────────────────────────────
// ─── @desc    Delete a comment (only the comment author can do this)
// ─── @access  Private

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Only the comment author can delete it
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments." });
    }

    // Remove the comment reference from the post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // Delete the comment document
    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { addComment, getComments, deleteComment };