const AcademicFile = require("../models/AcademicFile");
const User         = require("../models/User");
const { cloudinary } = require("../middleware/uploadMiddleware");

// ─── Helper: upload or replace PDF by type ───────────────────
const uploadPDFByType = async (type, req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    // Delete previous file from Cloudinary if it exists
    const existing = await AcademicFile.findOne({ type }).sort({ createdAt: -1 });
    if (existing && existing.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId, { resource_type: "raw" });
      await existing.deleteOne();
    }

    // Cloudinary gives us a secure URL directly — no local path needed
    const newFile = await AcademicFile.create({
      type,
      originalName: req.file.originalname,
      filePath:     req.file.path,       // Cloudinary secure URL
      cloudinaryId: req.file.filename,   // Cloudinary public_id for deletion later
      uploadedBy:   req.user._id,
    });

    const populated = await newFile.populate("uploadedBy", "name role");

    res.status(201).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} PDF uploaded successfully.`,
      file: {
        _id:          newFile._id,
        type:         newFile.type,
        originalName: newFile.originalName,
        fileUrl:      newFile.filePath, // direct Cloudinary URL
        uploadedBy:   populated.uploadedBy,
        uploadedAt:   newFile.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

const uploadRoutine  = (req, res) => uploadPDFByType("routine",  req, res);
const uploadResult   = (req, res) => uploadPDFByType("result",   req, res);
const uploadSeatPlan = (req, res) => uploadPDFByType("seatplan", req, res);

// ─── Get all users ────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

// ─── Delete user ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") return res.status(400).json({ message: "Admin account cannot be deleted." });

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.startsWith("http")) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`metrovia/images/${publicId}`).catch(() => {});
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

module.exports = { uploadRoutine, uploadResult, uploadSeatPlan, getAllUsers, deleteUser };