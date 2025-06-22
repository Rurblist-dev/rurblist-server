const express = require("express");
const User = require("../schemas/User"); // Add this import
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser,
} = require("../controllers/auth");

// Remove the app.set lines - they're now in server.js

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

// Add a new route for reset success page
router.get("/reset-success", (req, res) => {
  res.render("reset-success", {
    frontendUrl: process.env.FRONTEND_URL,
  });
});

// Update the reset password route
router.get("/reset-password/:token", async (req, res) => {
  // console.log("Received get request for reset password");
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("error", {
        message: "Invalid or expired reset link",
        frontendUrl: process.env.FRONTEND_URL,
      });
    }

    return res.render("reset-password", {
      token,
      frontendUrl: process.env.FRONTEND_URL,
    });
  } catch (error) {
    return res.render("error", {
      message: "Something went wrong",
      frontendUrl: process.env.FRONTEND_URL,
    });
  }
});

// Handle POST request for password reset
router.post("/reset-password/:token", resetPassword);

// 🔄 Add the refresh token route
router.post("/refresh", refreshToken);

// Logout route
router.post("/logout", logoutUser);

module.exports = router;
