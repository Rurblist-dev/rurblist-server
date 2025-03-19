const { genPassword, validatePass } = require("../lib/passwordUtils");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

require("dotenv").config();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email service
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME, // Your email username
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Welcome to Our Service",
    text: `Hello, ${name || "Valued Customer"}. Welcome to our platform!`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Rurblist - Your Access To Dream Home!</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
      color: #333;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
      "
    >
      <tr>
        <td
          style="
            padding: 20px;
            text-align: center;
            background-color: #ec6c10;
            color: #ffffff;
          "
        >
          <h1 style="margin: 0">Rurblist</h1>
          <p style="margin: 0">Your Access To Dream Home!</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px">
          <p>Dear <strong>${name || "Valued Customer"}</strong>,</p>

          <p>
            Congratulations on joining Rurblist, your premier marketplace for
            homes and properties!
          </p>

          <p>
            We're thrilled to have you on board! At Rurblist, our mission is to
            make finding your dream home or investment property seamless and
            enjoyable.
          </p>

          <h3>To get started:</h3>
          <ul style="padding-left: 20px; margin: 10px 0">
            <li>
              Browse our extensive listings: Explore thousands of properties,
              filtered by location, price, and amenities.
            </li>
            <li>
              Save your favorite listings: Create a personalized portfolio for
              easy reference.
            </li>
            <li>
              Connect with verified sellers/agents: Get expert guidance and
              negotiate the best deals.
            </li>
          </ul>

          <p style="text-align: center; margin: 20px 0">
            <a
              href="${process.env.FRONTEND_URL}"
              target="_blank"
              style="
                background-color: #ec6c10;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
              "
              >Start Exploring Properties</a
            >
          </p>

          <p>Need assistance? Our dedicated support team is here to help:</p>
          <p style="text-align: left; font-size: 14px; color: #333">
            <strong>Email:</strong>
            <a href="mailto:support@rurblist.com" style="color: #ec6c10"
              >support@rurblist.com</a
            ><br />
            <strong>Phone:</strong> +2348154155124
          </p>

          <p>Thank you for choosing Rurblist!</p>

          <p>Best regards,</p>
          <p>Support team<br />Rurblist</p>

          <hr
            style="border: none; border-top: 1px solid #ddd; margin: 20px 0"
          />

          <p style="text-align: center; font-size: 14px; color: #555">
            P.S. Follow us on social media for exclusive updates, market
            insights, and property tips!
          </p>

          <p style="text-align: center">
            <a
              href="[Insert Facebook Link]"
              style="color: #ec6c10; text-decoration: none"
              >Facebook</a
            >
            |
            <a
              href="[Insert Twitter Link]"
              style="color: #ec6c10; text-decoration: none"
              >Twitter</a
            >
            |
            <a
              href="https://www.instagram.com/rurblist"
              style="color: #ec6c10; text-decoration: none"
              >Instagram</a
            >
            |
            <a
              href="[Insert LinkedIn Link]"
              style="color: #ec6c10; text-decoration: none"
              >LinkedIn</a
            >
          </p>
        </td>
      </tr>
      <tr>
        <td
          style="
            padding: 10px;
            text-align: center;
            background-color: #f1f1f1;
            color: #777;
            font-size: 12px;
          "
        >
          &copy; 2024 Rurblist. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>
`, // Ensure this file path is correct
  };

  return transporter.sendMail(mailOptions);
};

const registerUser = async (req, res, next) => {
  const { password, email, username, ...otherDetails } = req.body;

  try {
    // Generate salt and hash for the password
    const { salt, hash } = genPassword(password);

    // Create user credentials
    const userCred = { salt, hash, email, username, ...otherDetails };

    // Create a new user instance
    const userInstance = new User(userCred);

    // Save the user to the database
    await userInstance.save();

    // Send a welcome email
    await sendWelcomeEmail(email, username);

    // Respond with success
    res.status(201).json({
      message: "User successfully created",
      status: 201,
    });
  } catch (error) {
    // Pass errors to the error-handling middleware
    next(error);
  }
};

const loginUser = (req, res, next) => {
  const { username, password, email } = req.body;

  // Allow login with either username or email
  const query = email ? { email } : { username };

  User.findOne(query)
    .then((user) => {
      // Check if user exists
      if (!user) {
        return res.status(401).json({
          message: "Failed",
          status: 401,
          details: "Invalid Credentials - User not found",
        });
      }

      // Compare passwords match
      const isValid = validatePass(password, user.hash, user.salt);

      if (isValid) {
        const token = jwt.sign(
          { id: user._id.toString(), isAdmin: user.isAdmin, email: user.email },
          process.env.JWT_SECRET
        );

        res.status(200).json({
          message: "Success",
          status: 200,
          details: "User successfully logged in 😇",
          token,
        });
      } else {
        // Return an error for invalid password
        res.status(401).json({
          message: "Failed",
          status: 401,
          details: "Invalid Credentials - Wrong password",
        });
      }
    })
    .catch((err) => {
      next(err);
    });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.tokenExpiration = tokenExpiration;
    await user.save();

    // Create reset URL using environment variable
    const resetUrl = `${process.env.SERVER_BASE_URL}/api/v1/auth/reset-password/${resetToken}`;

    // Get a proper display name from user data
    const usernameIsFullName = user.username && user.username.includes(" ");
    const displayName =
      user.name ||
      (usernameIsFullName ? user.username : null) ||
      email.split("@")[0];

    // Send email with styled template and proper name
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Reset Your Password - Rurblist",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="padding: 20px; text-align: center; background-color: #ec6c10; color: #ffffff;">
              <h1 style="margin: 0">Rurblist</h1>
              <p style="margin: 5px 0 0 0">Password Reset</p>
            </div>
            
            <div style="padding: 20px;">
              <h2>Reset Your Password</h2>
              <p>Hello ${displayName},</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #ec6c10; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
              
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0">
              
              <p style="font-size: 12px; color: #777; text-align: center;">
                &copy; 2024 Rurblist. All rights reserved.<br>
                Need help? Contact us at <a href="mailto:support@rurblist.com" style="color: #ec6c10;">support@rurblist.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params; // Token from URL
    const { newPassword } = req.body; // New password from user input

    console.log("Processing password reset request", {
      token,
      hasPassword: !!newPassword,
    });

    // Check if token and newPassword are provided
    if (!token) {
      return res.status(400).render("error", {
        message: "Reset token is required"
      });
    }

    if (!newPassword) {
      return res.status(400).render("error", {
        message: "New password is required"
      });
    }

    // Find the user with the provided reset token and check if it's not expired
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }, // Check if the token is not expired
    });

    if (!user) {
      console.log("Invalid or expired token", { token });
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
        detail: "The password reset link is invalid or has expired.",
      });
    }

    console.log("User found for password reset", { userId: user._id });

    // Generate new salt and hash for the password
    const { salt, hash } = genPassword(newPassword);

    // Update user's password and clear reset token fields
    user.salt = salt;
    user.hash = hash;
    user.resetToken = undefined;
    user.tokenExpiration = undefined;

    // Save the updated user to database
    await user.save();

    console.log("Password reset successful");

    // Return success response
    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully",
      redirectUrl:
        `${process.env.FRONTEND_URL}/auth/signin` ||
        "/api/v1/auth/reset-success",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
