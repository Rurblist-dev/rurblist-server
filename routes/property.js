const express = require("express");
const {
  createProperty,
  getAllProperties,
  getAllActiveProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addCommentToProperty,
  likeProperty,
  getPropertiesByUserId, // Import the function
} = require("../controllers/property");
const { verifyToken, verifyAdmin } = require("../lib/verifyToken");
const handleUpload = require("../middlewares/uploadImage");
// const multer = require("multer");

const router = express.Router();

// Property Routes
router.post("/create", verifyToken, handleUpload, createProperty);
router.get("/", verifyAdmin, getAllProperties);
router.get("/active", getAllActiveProperties);
router.get("/:id", verifyToken, getPropertyById);
router.put("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

// Additional Routes for Property Features
router.post("/:id/comment", verifyToken, addCommentToProperty);
router.post("/:id/like", verifyToken, likeProperty);

// Route to get properties by user ID
router.get("/user/:id", verifyToken, getPropertiesByUserId);

module.exports = router;
