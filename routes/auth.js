const express = require("express");
const User = require("../schemas/User"); // Add this import
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// Remove the app.set lines - they're now in server.js

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

// Handle GET request for password reset
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).render("error", {
        message: "Invalid or Expired Link",
      });
    }

    // Serve a simple HTML form for password reset
    res.status(200).render("reset-password", {
      token: token, // Pass token to template
      message: "Reset Your Password"
    });
  } catch (error) {
    console.error("Password reset page error:", error);
    // Send a generic error page
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});

// Handle POST request for password reset
router.post("/reset-password/:token", resetPassword);

router.get("/reset-success", (req, res) => {
  res.status(200).render("reset-success", {
    message: "Password reset successful",
  });
});

module.exports = router;
