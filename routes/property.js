const express = require("express");
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addCommentToProperty,
  likeProperty,
  getPropertiesByUserId, // Import the function
} = require("../controllers/property");
const { verifyToken } = require("../lib/verifyToken");
const multer = require("multer");

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
}).array("images", 10);

// Middleware to handle file upload
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        error: "File upload error",
        details: err.message,
      });
    } else if (err) {
      console.error("Other upload error:", err);
      return res.status(500).json({
        success: false,
        error: "Server error during upload",
        details: err.message,
      });
    }
    next();
  });
};

// Property Routes
router.post("/create", verifyToken, handleUpload, createProperty);
router.get("/", getAllProperties);
router.get("/:id", verifyToken, getPropertyById);
router.put("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

// Additional Routes for Property Features
router.post("/:id/comment", verifyToken, addCommentToProperty);
router.post("/:id/like", verifyToken, likeProperty);

// Route to get properties by user ID
router.get("/user/:id", verifyToken, getPropertiesByUserId);

module.exports = router;
