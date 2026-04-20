const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // The real user who created the post (always stored)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // If set, the post is displayed as posted BY this page
    // (Facebook-style: post shows page name + page avatar)
    // null = regular user post
    postedAs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
    },

    text: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    image: {
      type: String,
      default: "",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    // Which page this post belongs to (for page feed filtering)
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);