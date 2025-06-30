const reviewsController = require("../../controllers/reviews");
const Review = require("../../schemas/Reviews");
const User = require("../../schemas/User");

jest.mock("../../schemas/Reviews");
jest.mock("../../schemas/User");

describe("Reviews Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("should return 400 if required fields are missing", async () => {
      req.body = { realtor: "1", reviewer: null, rating: null };
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Realtor, reviewer, and rating are required",
      });
    });

    it("should return 400 if rating is out of bounds", async () => {
      req.body = { realtor: "1", reviewer: "2", rating: 6 };
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating must be between 1 and 5",
      });
    });

    it("should return 404 if realtor not found", async () => {
      req.body = { realtor: "1", reviewer: "2", rating: 5 };
      User.findById.mockResolvedValue(null);
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Realtor not found" });
    });

    it("should create review and update user rating", async () => {
      req.body = { realtor: "1", reviewer: "2", rating: 4 };
      const user = { rating: null, save: jest.fn() };
      User.findById.mockResolvedValue(user);
      Review.prototype.save = jest.fn().mockResolvedValue();
      Review.mockImplementation(function (data) {
        return { ...data, save: Review.prototype.save };
      });

      await reviewsController.createReview(req, res);

      expect(Review.prototype.save).toHaveBeenCalled();
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body));
    });

    it("should increment existing rating count", async () => {
      req.body = { realtor: "1", reviewer: "2", rating: 3 };
      const user = { rating: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0 }, save: jest.fn() };
      User.findById.mockResolvedValue(user);
      Review.prototype.save = jest.fn().mockResolvedValue();
      Review.mockImplementation(function (data) {
        return { ...data, save: Review.prototype.save };
      });

      await reviewsController.createReview(req, res);

      expect(user.rating[3]).toBe(2);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle errors and return 400", async () => {
      req.body = { realtor: "1", reviewer: "2", rating: 5 };
      User.findById.mockRejectedValue(new Error("DB error"));
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("getAllReviews", () => {
    it("should return all reviews", async () => {
      const reviews = [{}, {}];
      Review.find.mockResolvedValue(reviews);
      await reviewsController.getAllReviews(req, res);
      expect(res.json).toHaveBeenCalledWith(reviews);
    });

    it("should handle errors and return 500", async () => {
      Review.find.mockRejectedValue(new Error("DB error"));
      await reviewsController.getAllReviews(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("getReviewsByRealtor", () => {
    it("should return reviews for a specific realtor", async () => {
      req.params.realtorId = "1";
      const reviews = [{}, {}];
      Review.find.mockResolvedValue(reviews);
      await reviewsController.getReviewsByRealtor(req, res);
      expect(Review.find).toHaveBeenCalledWith({ realtor: "1" });
      expect(res.json).toHaveBeenCalledWith(reviews);
    });

    it("should handle errors and return 500", async () => {
      req.params.realtorId = "1";
      Review.find.mockRejectedValue(new Error("DB error"));
      await reviewsController.getReviewsByRealtor(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("getReviewById", () => {
    it("should return a review by ID", async () => {
      req.params.id = "123";
      const review = { _id: "123" };
      Review.findById.mockResolvedValue(review);
      await reviewsController.getReviewById(req, res);
      expect(res.json).toHaveBeenCalledWith(review);
    });

    it("should return 404 if review not found", async () => {
      req.params.id = "123";
      Review.findById.mockResolvedValue(null);
      await reviewsController.getReviewById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Review not found" });
    });

    it("should handle errors and return 500", async () => {
      req.params.id = "123";
      Review.findById.mockRejectedValue(new Error("DB error"));
      await reviewsController.getReviewById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("updateReview", () => {
    it("should update and return the review", async () => {
      req.params.id = "123";
      req.body = { rating: 5 };
      const updatedReview = { _id: "123", rating: 5 };
      Review.findByIdAndUpdate.mockResolvedValue(updatedReview);
      await reviewsController.updateReview(req, res);
      expect(res.json).toHaveBeenCalledWith(updatedReview);
    });

    it("should return 404 if review not found", async () => {
      req.params.id = "123";
      Review.findByIdAndUpdate.mockResolvedValue(null);
      await reviewsController.updateReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Review not found" });
    });

    it("should handle errors and return 400", async () => {
      req.params.id = "123";
      Review.findByIdAndUpdate.mockRejectedValue(new Error("Validation error"));
      await reviewsController.updateReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
    });
  });

  describe("deleteReview", () => {
    it("should delete the review and return success message", async () => {
      req.params.id = "123";
      Review.findByIdAndDelete.mockResolvedValue({ _id: "123" });
      await reviewsController.deleteReview(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Review deleted successfully" });
    });

    it("should return 404 if review not found", async () => {
      req.params.id = "123";
      Review.findByIdAndDelete.mockResolvedValue(null);
      await reviewsController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Review not found" });
    });

    it("should handle errors and return 500", async () => {
      req.params.id = "123";
      Review.findByIdAndDelete.mockRejectedValue(new Error("DB error"));
      await reviewsController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });
});
