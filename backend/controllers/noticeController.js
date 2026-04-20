// Handles create and fetch notices
const Notice = require("../models/Notice");

// ─── @route   POST /api/notices ───────────────────────────────────────────────
// ─── @desc    Create a new notice
// ─── @access  Private (admin only)

const createNotice = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Notice title is required." });
    }

    if (!body || body.trim() === "") {
      return res.status(400).json({ message: "Notice body is required." });
    }

    const notice = await Notice.create({
      title: title.trim(),
      body: body.trim(),
      postedBy: req.user._id,
    });

    const populated = await notice.populate("postedBy", "name role");

    res.status(201).json({
      message: "Notice created successfully.",
      notice: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/notices ────────────────────────────────────────────────
// ─── @desc    Get all notices (newest first)
// ─── @access  Private (all logged-in users)

const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name role");

    res.status(200).json({ notices });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/notices/:id ───────────────────────────────────────────
// ─── @desc    Get a single notice by ID
// ─── @access  Private (all logged-in users)

const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate("postedBy", "name role");

    if (!notice) {
      return res.status(404).json({ message: "Notice not found." });
    }

    res.status(200).json({ notice });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   DELETE /api/notices/:id ────────────────────────────────────────
// ─── @desc    Delete a notice by ID
// ─── @access  Private (admin only)

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found." });
    }

    await notice.deleteOne();

    res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
};