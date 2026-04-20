// Mongoose schema: title, body, targetRole, createdAt
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    // Short headline of the notice
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Full content/body of the notice
    body: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Admin user who posted this notice
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt acts as the notice date
  }
);

module.exports = mongoose.model("Notice", noticeSchema);