const AcademicFile = require("../models/AcademicFile");

const getLatestByType = async (type, res) => {
  try {
    const file = await AcademicFile.findOne({ type })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name role");

    if (!file) {
      return res.status(404).json({ message: `No ${type} file has been uploaded yet.` });
    }

    // filePath is now a direct Cloudinary URL
    res.status(200).json({
      file: {
        _id:          file._id,
        type:         file.type,
        originalName: file.originalName,
        fileUrl:      file.filePath, // direct Cloudinary URL
        uploadedBy:   file.uploadedBy,
        uploadedAt:   file.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error." });
  }
};

const getRoutine  = (req, res) => getLatestByType("routine",  res);
const getResult   = (req, res) => getLatestByType("result",   res);
const getSeatPlan = (req, res) => getLatestByType("seatplan", res);

module.exports = { getRoutine, getResult, getSeatPlan };