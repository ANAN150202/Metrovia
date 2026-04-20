// Handles send and receive 1-to-1 messages
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// ─── @route   POST /api/messages ─────────────────────────────────────────────
// ─── @desc    Send a message to another user
// ─── @desc    Creates a new conversation if one doesn't exist yet
// ─── @desc    Reuses existing conversation if one already exists
// ─── @access  Private

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    // Basic validation
    if (!receiverId || !text || text.trim() === "") {
      return res.status(400).json({ message: "Receiver and message text are required." });
    }

    // Prevent messaging yourself
    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot send a message to yourself." });
    }

    // Make sure the receiver actually exists
    const receiver = await User.findById(receiverId).select("_id name avatar");
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // ── Find or create the conversation between these two users ──────────────
    // We check both orderings of participants to find an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // No existing conversation — create one
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // ── Create the message ────────────────────────────────────────────────────
    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
      isRead: false,
    });

    // ── Update the conversation's lastMessage pointer ─────────────────────────
    conversation.lastMessage = message._id;
    // Also bump updatedAt so conversations list stays sorted by most recent
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info before returning
    const populated = await message.populate("sender", "name avatar");

    res.status(201).json({
      message: "Message sent.",
      data: populated,
      conversationId: conversation._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/messages/conversations ────────────────────────────────
// ─── @desc    Get all conversations for the logged-in user (most recent first)
// ─── @access  Private

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the logged-in user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .sort({ updatedAt: -1 }) // most recently active first
      .populate("participants", "name avatar role")
      .populate({
        path: "lastMessage",
        select: "text isRead sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/messages/conversation/:conversationId ─────────────────
// ─── @desc    Get all messages in a specific conversation
// ─── @access  Private (only participants can view)

const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Verify the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Make sure the logged-in user is actually part of this conversation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this conversation." });
    }

    // Fetch all messages in this conversation, oldest first
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   PUT /api/messages/conversation/:conversationId/read ─────────────
// ─── @desc    Mark all unread messages in a conversation as read
// ─── @desc    Only marks messages where the logged-in user is the receiver
// ─── @access  Private

const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Verify the conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this conversation." });
    }

    // Mark all messages in this conversation where the current user is the receiver
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
};