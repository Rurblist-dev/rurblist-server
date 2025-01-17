const express = require("express");
const router = express.Router();
const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
} = require("../controllers/tour");

// Route to create a new tour
router.post("/", createTour);

// Route to get all tours
router.get("/", getAllTours);

// Route to get a specific tour by ID
router.get("/:id", getTourById);

// Route to update a specific tour by ID
router.put("/:id", updateTour);

// Route to delete a specific tour by ID
router.delete("/:id", deleteTour);

module.exports = router;
