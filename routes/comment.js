const express = require("express");
const {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");
const { verifyToken } = require("../lib/verifyToken");
const router = express.Router();

// Create a comment
router.post("/", verifyToken, createComment);

// Get all comments
router.get("/", verifyToken, getComments);

// Get a single comment by ID
router.get("/:commentId", verifyToken, getComment);

// Update a comment by ID
router.put("/:commentId", verifyToken, updateComment);

// Delete a comment by ID
router.delete("/:commentId", verifyToken, deleteComment);

module.exports = router;
