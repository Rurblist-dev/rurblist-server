const Comment = require("../schemas/Comment");
const Property = require("../schemas/Property");
const mongoose = require("mongoose");

// Create a comment
const createComment = async (req, res) => {
  try {
    // Get propertyId from URL parameters
    const propertyId = req.params.id;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: "Property ID is required",
      });
    }

    // Validate property ID format
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID format",
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

    // Trim comment and validate length
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Comment must be at least 2 characters long",
      });
    }

    const newComment = await Comment.create({
      comment: trimmedComment,
      property: propertyId,
      user: userId,
    });

    // Update property with new comment
    await Property.findByIdAndUpdate(propertyId, {
      $push: { comments: newComment._id },
    });

    // Fetch the populated comment
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "username email")
      .populate("property", "title");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
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
    const { id } = req.params; // Fix: Changed from commentId to id based on routes
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment ID format.",
      });
    }

    // First verify the comment exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found.",
      });
    }

    // Check if user is authorized to delete
    if (comment.user.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this comment.",
      });
    }

    // Remove comment from property first to maintain referential integrity
    await Property.updateOne(
      { _id: comment.property },
      { $pull: { comments: id } }
    );

    // Now delete the comment
    const deletedComment = await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete comment.",
      details:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
};
