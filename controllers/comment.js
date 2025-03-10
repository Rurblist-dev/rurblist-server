const Comment = require("../schemas/Comment");
const Property = require("../schemas/Property");
const mongoose = require("mongoose");

// Create a comment
const createComment = async (req, res) => {
  try {
    // Get propertyId from URL parameters
    const propertyId = req.params.id; // Changed from req.params.propertyId

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: "Property ID is required",
      });
    }

    // Validate if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({
        success: false,
        error: "Comment text is required",
      });
    }

    const newComment = await Comment.create({
      comment,
      property: propertyId, // Explicitly set the property ID
      user: userId,
    });

    // Update property with new comment
    await Property.findByIdAndUpdate(propertyId, {
      $push: { comments: newComment._id },
    });

    // Fetch the populated comment
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "name email")
      .populate("property", "title");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details: error.message,
    });
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
    const { id } = req.params; // Fix: Changed from destructuring commentId to id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment ID format.",
      });
    }

    const comment = await Comment.findById(id)
      .populate("user", "-salt -hash")
      .populate("property", "title")
      .lean();

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Get comment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch comment.",
      details: error.message,
    });
  }
};

// Update a comment by ID
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment: commentText } = req.body;
    const userId = req.user.id;

    console.log("Update Comment - ID:", id);
    console.log("Update Comment - Text:", commentText);
    console.log("Update Comment - UserId:", userId);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment ID format",
      });
    }

    const existingComment = await Comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to edit this comment",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { comment: commentText },
      { new: true }
    )
      .populate("user", "-salt -hash")
      .populate("property", "title");

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update comment",
      details: error.message,
    });
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
