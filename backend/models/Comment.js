// Mongoose schema: postId, author, text, createdAt
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // The post this comment belongs to
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    // The user who wrote this comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text content of the comment
    // No replies — flat comment structure only
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);