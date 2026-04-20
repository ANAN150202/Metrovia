// Mongoose schema: type (routine/result/seatplan), filename, uploadedBy
const mongoose = require("mongoose");

const academicFileSchema = new mongoose.Schema(
  {
    // Type determines which section this PDF belongs to
    type: {
      type: String,
      enum: ["routine", "result", "seatplan"],
      required: true,
    },

    // Original filename as uploaded by admin
    originalName: {
      type: String,
      required: true,
    },

    // Stored filename/path inside uploads/pdfs/<type>/
    filePath: {
      type: String,
      required: true,
    },

    // Admin user who uploaded this file
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt shows when the file was uploaded
  }
);

module.exports = mongoose.model("AcademicFile", academicFileSchema);