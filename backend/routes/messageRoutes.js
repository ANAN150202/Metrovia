// GET /api/messages/:userId  POST /api/messages
const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

// All message routes require login

// @route   POST /api/messages
// @desc    Send a message to another user
// @desc    Creates or reuses a conversation automatically
// @access  Private
router.post("/", protect, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
// NOTE: defined before /:conversationId to avoid param conflict
router.get("/conversations", protect, getConversations);

// @route   GET /api/messages/conversation/:conversationId
// @desc    Get all messages in a specific conversation
// @access  Private (participants only)
router.get("/conversation/:conversationId", protect, getMessages);

// @route   PUT /api/messages/conversation/:conversationId/read
// @desc    Mark all unread messages in a conversation as read
// @access  Private (participants only)
router.put("/conversation/:conversationId/read", protect, markAsRead);

module.exports = router;