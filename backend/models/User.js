const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique email address used for login
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password (bcrypt)
    password: {
      type: String,
      required: true,
    },

    // Role determines access level
    // admin is only set via seed/hardcode — never via signup
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    // Profile picture filename (stored in uploads/images/)
    avatar: {
      type: String,
      default: "", // empty means use default avatar on frontend
    },

    // Short bio — only editable profile field (along with avatar)
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    // Identity fields — set at signup, never editable after
    department: {
      type: String,
      default: "",
    },

    // e.g. "3rd Year" for students, left empty for teachers
    year: {
      type: String,
      default: "",
    },

    // Student ID or Teacher ID
    studentId: {
      type: String,
      default: "",
    },

    // Favourite users and pages — persisted so they survive page refresh
    favourites: {
      // Other users this user has favourited
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      // Club/society pages this user has favourited
      pages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Page",
        },
      ],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);