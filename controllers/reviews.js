const Review = require("../schemas/Reviews");
const User = require("../schemas/User");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.realtor || !req.body.reviewer || !req.body.rating) {
      return res
        .status(400)
        .json({ error: "Realtor, reviewer, and rating are required" });
    }
    // Validate rating
    if (req.body.rating < 1 || req.body.rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(req.body.realtor);
    if (!user) {
      return res.status(404).json({ error: "Realtor not found" });
    }

    const review = new Review(req.body);
    await review.save();

    // console.log("Review created:", Object.entries(user.rating).length);
    if (Object.entries(user.rating).length > 0) {
      //update the review count and rating of the realtor
      const rateValue = req.body.rating;
      user.rating[rateValue] += 1;
      user.markModified("rating");
      await user.save();
    } else {
      user.rating = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      user.rating[req.body.rating] = 1; // Initialize the rating count
      await user.save();
    }
    // realtor.rating ;
    // realtor.reviewCount = newTotalReviews;
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews for a specific realtor
exports.getReviewsByRealtor = async (req, res) => {
  try {
    const { realtorId } = req.params;
    const populatedReviews = await Review.find({ realtor: realtorId })
      .populate("realtor", "id firstName lastName profileImg")
      .populate("reviewer", "id firstName lastName profileImg");
    res.json(populatedReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a review by ID
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
