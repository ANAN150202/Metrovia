// Handles fetching uploaded academic PDF files
const AcademicFile = require("../models/AcademicFile");

// ─── Helper: fetch latest file by type ───────────────────────────────────────
// Reused by all three GET handlers below

const getLatestByType = async (type, res) => {
  try {
    // Get the most recently uploaded file of this type
    const file = await AcademicFile.findOne({ type })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name role");

    if (!file) {
      return res.status(404).json({
        message: `No ${type} file has been uploaded yet.`,
      });
    }

    // Build a full accessible URL for the frontend to load the PDF
    // Frontend can use this URL directly in an <iframe> or PDF viewer
    const fileUrl = `/uploads/pdfs/${type}/${file.filePath}`;

    res.status(200).json({
      file: {
        _id: file._id,
        type: file.type,
        originalName: file.originalName,
        fileUrl,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── @route   GET /api/academic/routine ──────────────────────────────────────
// ─── @desc    Get the latest uploaded Routine PDF
// ─── @access  Private (logged-in users)

const getRoutine = (req, res) => getLatestByType("routine", res);

// ─── @route   GET /api/academic/result ───────────────────────────────────────
// ─── @desc    Get the latest uploaded Result PDF
// ─── @access  Private (logged-in users)

const getResult = (req, res) => getLatestByType("result", res);

// ─── @route   GET /api/academic/seatplan ─────────────────────────────────────
// ─── @desc    Get the latest uploaded Seat Plan PDF
// ─── @access  Private (logged-in users)

const getSeatPlan = (req, res) => getLatestByType("seatplan", res);

module.exports = { getRoutine, getResult, getSeatPlan };