const express = require("express");
const router  = express.Router();
const {
  createPage, getAllPages, searchPages, getPageById,
  updatePage, toggleJoinPage, createPagePost,
  getPagePosts, transferOwnership,
} = require("../controllers/pageController");
const { protect }       = require("../middleware/authMiddleware");
const { uploadImage }   = require("../middleware/uploadMiddleware");

// Use fields() to accept both avatar and banner in one request
const uploadPageImages = uploadImage.fields([
  { name: "avatar", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

router.get("/search",             protect, searchPages);
router.get("/",                   protect, getAllPages);
router.post("/",                  protect, uploadPageImages, createPage);
router.get("/:id",                protect, getPageById);
router.put("/:id",                protect, uploadPageImages, updatePage);
router.post("/:id/join",          protect, toggleJoinPage);
router.post("/:id/posts",         protect, uploadImage.single("image"), createPagePost);
router.get("/:id/posts",          protect, getPagePosts);
router.put("/:id/transfer",       protect, transferOwnership);

module.exports = router;