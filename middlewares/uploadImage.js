const multer = require("multer");

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
}).fields([
  { name: "profileImg", maxCount: 1 },
  { name: "ninSlipImg", maxCount: 1 },
  { name: "images", maxCount: 10 }, // keep this if you want to allow "images" field too
]);

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

module.exports = handleUpload;
