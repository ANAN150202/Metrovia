const mongoose = require("mongoose");

const academicFileSchema = new mongoose.Schema(
  {
    type: {
      type:     String,
      enum:     ["routine", "result", "seatplan"],
      required: true,
    },
    originalName: {
      type:     String,
      required: true,
    },
    // Cloudinary secure URL (used directly as fileUrl)
    filePath: {
      type:     String,
      required: true,
    },
    // Cloudinary public_id — needed to delete the file later
    cloudinaryId: {
      type:    String,
      default: "",
    },
    uploadedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicFile", academicFileSchema);