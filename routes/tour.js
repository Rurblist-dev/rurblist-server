const express = require("express");
const router = express.Router();
const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  getTourByUserId,
} = require("../controllers/tour");
const { verifyToken } = require("../lib/verifyToken");

// Route to create a new tour
router.post("/", verifyToken, createTour);

// Route to get all tours
router.get("/", verifyToken, getAllTours);

// Route to get a specific tour by ID
router.get("/:id", verifyToken, getTourById);

// Route to get the tours for a specific user
router.get("/user/:id", verifyToken, getTourByUserId);

// Route to update a specific tour by ID
router.put("/:id", verifyToken, updateTour);

// Route to delete a specific tour by ID
router.delete("/:id", verifyToken, deleteTour);

module.exports = router;
