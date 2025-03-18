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
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Reset - Invalid Token</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background-color: #f9f9f9; }
            .container { max-width: 500px; margin: 40px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #ec6c10; margin-top: 0; }
            .btn { display: inline-block; background: #ec6c10; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .error-icon { font-size: 48px; color: #ec6c10; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">⚠️</div>
            <h1>Invalid or Expired Link</h1>
            <p>The password reset link you used is invalid or has expired.</p>
            <p>Please request a new password reset link.</p>
            <a href="${
              process.env.FRONTEND_URL || "/"
            }" class="btn">Return to Home</a>
          </div>
        </body>
        </html>
      `);
    }

    // Serve a simple HTML form for password reset
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Your Password - Rurblist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background-color: #f9f9f9; }
          .container { max-width: 500px; margin: 40px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #ec6c10; margin-top: 0; }
          .form-group { margin-bottom: 20px; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .btn { background: #ec6c10; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; }
          .error { color: red; margin-top: 10px; display: none; }
          .success { color: green; margin-top: 10px; display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>Enter your new password below:</p>
          
          <form id="resetForm">
            <div class="form-group">
              <label for="password">New Password</label>
              <input type="password" id="password" required minlength="6">
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" required minlength="6">
            </div>
            
            <button type="submit" class="btn">Reset Password</button>
            
            <p id="error" class="error"></p>
            <p id="success" class="success">Password reset successfully!</p>
          </form>
        </div>
        
        <script>
          const form = document.getElementById('resetForm');
          const error = document.getElementById('error');
          const success = document.getElementById('success');
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Reset messages
            error.style.display = 'none';
            success.style.display = 'none';
            
            // Check if passwords match
            if (password !== confirmPassword) {
              error.textContent = 'Passwords do not match';
              error.style.display = 'block';
              return;
            }
            
            try {
              // Use the current URL for the POST request instead of depending on SERVER_BASE_URL
              const response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword: password })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                // Show success message
                success.style.display = 'block';
                form.reset();
                
                // Redirect after 2 seconds
                setTimeout(() => {
                  window.location.href = data.redirectUrl || '${
                    process.env.FRONTEND_URL || "/"
                  }';
                }, 2000);
              } else {
                // Show error message
                error.textContent = data.message || 'An error occurred';
                error.style.display = 'block';
              }
            } catch (err) {
              error.textContent = 'Server error. Please try again later.';
              error.style.display = 'block';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Password reset page error:", error);
    // Send a generic error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Rurblist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background-color: #f9f9f9; }
          .container { max-width: 500px; margin: 40px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #ec6c10; margin-top: 0; }
          .btn { display: inline-block; background: #ec6c10; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .error-icon { font-size: 48px; color: #ec6c10; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">⚠️</div>
          <h1>Oops! Something went wrong</h1>
          <p>Something went wrong</p>
          <a href="${
            process.env.FRONTEND_URL || "/"
          }" class="btn">Return to Home</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Handle POST request for password reset
router.post("/reset-password/:token", resetPassword);

module.exports = router;
