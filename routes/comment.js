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

// Base route for all comments
router.get("/", verifyToken, getComments);

// Comment operations on a specific property
router.post("/properties/:id", verifyToken, createComment);

// Operations on specific comments
router.get("/:id", verifyToken, getComment);
router.put("/:id", verifyToken, updateComment); // Changed from :commentId to :id
router.delete("/:id", verifyToken, deleteComment); // Changed from :commentId to :id

module.exports = router;
