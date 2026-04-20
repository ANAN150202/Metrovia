// Multer configuration for image and PDF uploads
const multer = require("multer");
const path = require("path");

// ─── Allowed file types ───────────────────────────────────────────────────────

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PDF_TYPES   = ["application/pdf"];

// ─── Storage config for profile/post images ──────────────────────────────────

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── Storage config for academic PDFs ────────────────────────────────────────
// IMPORTANT: req.body is NOT reliable inside multer diskStorage callbacks when
// using multipart/form-data — multer hasn't finished parsing body fields yet.
// Solution: use req.pdfType which is set directly on the req object by the
// route middleware BEFORE multer runs. Properties set on req are always
// available inside multer callbacks.

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.pdfType is set in adminRoutes.js before this runs
    // e.g. (req, res, next) => { req.pdfType = "routine"; next(); }
    const type = req.pdfType;

    const validTypes = ["routine", "result", "seatplan"];
    if (!validTypes.includes(type)) {
      return cb(new Error("Invalid academic file type. Use routine, result, or seatplan."));
    }

    cb(null, path.join(__dirname, `../uploads/pdfs/${type}`));
  },
  filename: (req, file, cb) => {
    const type = req.pdfType || "file";
    const uniqueName = `${type}-${Date.now()}.pdf`;
    cb(null, uniqueName);
  },
});

// ─── File filter for images ───────────────────────────────────────────────────

const imageFileFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image type. Only JPEG, PNG, and WEBP are allowed."), false);
  }
};

// ─── File filter for PDFs ─────────────────────────────────────────────────────

const pdfFileFilter = (req, file, cb) => {
  if (PDF_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed."), false);
  }
};

// ─── Multer instances ─────────────────────────────────────────────────────────

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

module.exports = { uploadImage, uploadPDF };