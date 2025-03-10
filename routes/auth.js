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
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("error", {
        message: "Invalid or expired reset link",
      });
    }

    res.render("reset-password", {
      token,
      serverBaseUrl: process.env.SERVER_BASE_URL,
    });
  } catch (error) {
    res.render("error", {
      message: "Something went wrong",
    });
  }
});
router.post("/reset-password/:token", resetPassword);

router.get("/reset-success", (req, res) => {
  res.render("reset-success", {
    frontendUrl: process.env.FRONTEND_URL || process.env.SERVER_BASE_URL,
  });
});

module.exports = router;
