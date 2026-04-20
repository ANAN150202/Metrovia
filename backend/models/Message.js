// Mongoose schema: sender, receiver, text, timestamp
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // The conversation this message belongs to
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // User who sent this message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who receives this message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text content of the message
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Whether the receiver has read this message
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt acts as the message timestamp
  }
);

module.exports = mongoose.model("Message", messageSchema);