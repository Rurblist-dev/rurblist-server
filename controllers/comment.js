const Comment = require("../schemas/Comment");
const Property = require("../schemas/Property");
const mongoose = require("mongoose");

// Create a comment
const createComment = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const newComment = new Comment({
      comment,
      property: propertyId,
      user: userId,
    });

    const savedComment = await newComment.save();

    // Push the comment ID to the property's comments array
    await Property.findByIdAndUpdate(propertyId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: savedComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all comments for a property (or general fetch)
const getComments = async (req, res) => {
  try {
    // Fetch only necessary fields: comment ID, user ID, property ID
    const comments = await Comment.find()
      .select("comment user property") // Select only specific fields
      .populate({
        path: "user",
        select: "_id email username", // Only return user ID, email, and username
      })
      .populate({
        path: "property",
        select: "_id", // Only return property ID
      })
      .exec();

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch comments." });
  }
};

// Get a single comment by ID
const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID format." });
    }

    const comment = await Comment.findById(commentId)
      .select("comment user property") // Select only specific fields
      .populate({
        path: "user",
        select: "_id email username", // Only return user ID, email, and username
      })
      .populate({
        path: "property",
        select: "_id", // Only return property ID
      })
      .exec();

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch comment." });
  }
};

// Update a comment by ID
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID format." });
    }

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // Check if the user is authorized to edit this comment
    if (existingComment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this comment." });
    }

    // Update the comment
    existingComment.comment = comment || existingComment.comment;
    await existingComment.save();

    return res.status(200).json(existingComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update comment." });
  }
};

// Delete a comment by ID
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID format." });
    }

    // Attempt to delete the comment only if the user is the owner or an admin
    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      $or: [
        { user: userId },
        { user: req.user.isAdmin ? { $exists: true } : null },
      ],
    });

    if (!deletedComment) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized action." });
    }

    return res.status(200).json({
      message: "Comment deleted successfully.",
      deletedComment, // Optional: Remove if not needed
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ error: "Failed to delete comment." });
  }
};

module.exports = {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
};
