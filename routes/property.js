const express = require("express");
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addCommentToProperty,
  likeProperty,
} = require("../controllers/property");
const { verifyToken } = require("../lib/verifyToken");


const router = express.Router();

// Property Routes
router.post("/create", verifyToken, createProperty);
router.get("/", verifyToken, getAllProperties);
router.get("/:id", verifyToken, getPropertyById);
router.put("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

// Additional Routes for Property Features
router.post("/:id/comment", addCommentToProperty);
router.post("/:id/like", likeProperty);

module.exports = router;
