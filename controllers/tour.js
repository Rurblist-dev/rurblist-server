const Tour = require("../schemas/Tour");

// Create a new tour
exports.createTour = async (req, res) => {
  try {
    const { datetime, email, phone, fullname } = req.body;

    if (!datetime || !email || !phone || !fullname) {
      return res.status(400).json({
        success: false,
        error: "All fields (datetime, email, phone, fullname) are required.",
      });
    }

    // Basic validation
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }

    // Phone validation
    if (!/^(\+\d{1,3})?[-\s]?\d{3,}[-\s]?\d{3,}[-\s]?\d{3,}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format. Use format like: +123-456-789-000",
      });
    }

    const tour = await Tour.create({ datetime, email, phone, fullname });

    res.status(201).json({
      success: true,
      message: "Tour created successfully.",
      data: tour,
    });
  } catch (error) {
    // Handle validation errors from mongoose
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
      error: "Failed to create tour.",
      details: error.message,
    });
  }
};

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single tour by ID
exports.getTourById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid tour ID format",
      });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }
    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a tour
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid tour ID format",
      });
    }

    // Basic validation for phone if it's being updated
    if (
      req.body.phone &&
      !/^(\+\d{1,3})?[-\s]?\d{3,}[-\s]?\d{3,}[-\s]?\d{3,}$/.test(req.body.phone)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format. Use format like: +123-456-789-000",
      });
    }

    // Basic validation for email if it's being updated
    if (
      req.body.email &&
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(req.body.email)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }
    res.status(200).json({ success: true, data: updatedTour });
  } catch (error) {
    // Handle validation errors from mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: messages,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid tour ID format",
      });
    }

    const deletedTour = await Tour.findByIdAndDelete(id);
    if (!deletedTour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Tour deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
