const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Image storage ────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "metrovia/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation:  [{ width: 1200, crop: "limit" }],
  },
});

// ─── PDF storage ──────────────────────────────────────────────
// Using resource_type "raw" but adding flags for inline display
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder:          `metrovia/pdfs/${req.pdfType || "general"}`,
    allowed_formats: ["pdf"],
    resource_type:   "raw",
    public_id:       `${req.pdfType || "file"}-${Date.now()}`,
    // fl_attachment=false tells Cloudinary to serve inline not as download
    flags:           "attachment:false",
  }),
});

// ─── File filters ─────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPEG, PNG and WEBP allowed."), false);
};

const pdfFilter = (req, file, cb) => {
  file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("Only PDF files allowed."), false);
};

// ─── Multer instances ─────────────────────────────────────────
const uploadImage = multer({
  storage:    imageStorage,
  fileFilter: imageFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
});

const uploadPDF = multer({
  storage:    pdfStorage,
  fileFilter: pdfFilter,
  limits:     { fileSize: 20 * 1024 * 1024 },
});

module.exports = { uploadImage, uploadPDF, cloudinary };