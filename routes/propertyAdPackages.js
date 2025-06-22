const express = require("express");
const PropertyAdPackage = require("../schemas/PropertyAdPackages");
const { verifyAdmin } = require("../lib/verifyToken");
const {
  addNewAdPackage,
  updateAdPackage,
  deleteAdPackage,
  getAllAdPackages,
} = require("../controllers/propertyAdPackages");

const router = express.Router();

// Get all ad packages (Public - for selection)
router.get("/", getAllAdPackages);

// Create a new ad package (Admin only)
router.post("/", verifyAdmin, addNewAdPackage);

// Update an ad package (Admin only)
router.put("/:id", verifyAdmin, updateAdPackage);

// Delete an ad package (Admin only)
router.delete("/:id", verifyAdmin, deleteAdPackage);

module.exports = router;
