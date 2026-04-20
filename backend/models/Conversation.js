// Mongoose schema: participants[], lastMessage, updatedAt
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Exactly 2 participants for 1-to-1 messaging
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Reference to the most recent message in this conversation
    // Used to show preview text in the chat list
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true, // updatedAt helps sort conversations by most recent
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);