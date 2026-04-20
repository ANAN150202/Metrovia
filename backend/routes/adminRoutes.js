// POST /api/admin/upload  GET /api/admin/users
const express = require("express");
const router = express.Router();

const {
  uploadRoutine,
  uploadResult,
  uploadSeatPlan,
  getAllUsers,
  deleteUser,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { uploadPDF } = require("../middleware/uploadMiddleware");

// All admin routes are locked behind protect + authorizeRoles("admin")

// ─── PDF Upload Routes ────────────────────────────────────────────────────────
// We set req.pdfType directly on the request object (NOT req.body.type)
// because req.body is not yet available inside multer's diskStorage callbacks.
// req.pdfType is a plain property on req, always readable by multer.

// @route   POST /api/admin/upload/routine
// @access  Private (admin only)
router.post(
  "/upload/routine",
  protect,
  authorizeRoles("admin"),
  (req, res, next) => { req.pdfType = "routine"; next(); },
  uploadPDF.single("file"),
  uploadRoutine
);

// @route   POST /api/admin/upload/result
// @access  Private (admin only)
router.post(
  "/upload/result",
  protect,
  authorizeRoles("admin"),
  (req, res, next) => { req.pdfType = "result"; next(); },
  uploadPDF.single("file"),
  uploadResult
);

// @route   POST /api/admin/upload/seatplan
// @access  Private (admin only)
router.post(
  "/upload/seatplan",
  protect,
  authorizeRoles("admin"),
  (req, res, next) => { req.pdfType = "seatplan"; next(); },
  uploadPDF.single("file"),
  uploadSeatPlan
);

// ─── User Management Routes ───────────────────────────────────────────────────

// @route   GET /api/admin/users
// @access  Private (admin only)
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;