const { genPassword, validatePass } = require("../lib/passwordUtils");
const User = require("../schemas/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For random string tokens
const jwt = require("jsonwebtoken"); // If you prefer JWTs

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

const sendWelcomeEmail = async (email, firstName, lastName) => {
  const rurblistEmail = process.env.EMAIL_USERNAME;
  const currentYear = new Date().getFullYear();
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Welcome to Our Service",
    text: `Hello, ${firstName} ${lastName}. Welcome to our platform!`,
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
          <p>Dear <strong style={{textTransform:capitalize}}">${firstName}</strong>,</p>

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
              href="${process.env.FRONTEND_URL}/properties"
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
            <a href="mailto:${rurblistEmail}" style="color: #ec6c10"
              >${rurblistEmail}</a
            ><br />
            <strong>Phone:</strong> 1-800-RURBLIST
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
              href="[Insert Instagram Link]"
              style="color: #ec6c10; text-decoration: none"
              >Instagram</a
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
          &copy; ${currentYear} Rurblist. All rights reserved.
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
  const { password, email, firstName, lastName, ...otherDetails } = req.body;

  try {
    // Generate salt and hash for the password
    const { salt, hash } = genPassword(password);

    // Create user credentials
    const userCred = {
      salt,
      hash,
      email,
      firstName,
      lastName,
      ...otherDetails,
    };

    // Create a new user instance
    const userInstance = new User(userCred);

    // Save the user to the database
    await userInstance.save();

    // Send a welcome email
    await sendWelcomeEmail(email, firstName, lastName);

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

const loginUser = async (req, res, next) => {
  const { identifier, password } = req.body; // Use 'identifier' for both email and username

  // Allow login with either email or username
  const query =
    // { username: identifier };
    identifier.includes("@") ? { email: identifier } : { username: identifier };

  try {
    const user = await User.findOne(query);

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
      const accessToken = jwt.sign(
        { id: user._id.toString(), isAdmin: user.isAdmin, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );
      // Generate a refresh token (random string or JWT)
      const refreshToken = crypto.randomBytes(64).toString("hex");

      // Store in DB
      user.refreshToken = refreshToken;
      user.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      await user.save();

      // Send as HTTP-only cookie
      // secure: process.env.NODE_ENV === "production", // false in dev
      // sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      // console.log(refreshToken);

      res.status(200).json({
        message: "Success",
        status: 200,
        details: "User successfully logged in 😇",
        accessToken,
        userId: user._id,
        tokenExpiration: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
    } else {
      // Return an error for invalid password
      res.status(401).json({
        message: "Failed",
        status: 401,
        details: "Invalid Credentials - Wrong password",
      });
    }
  } catch (err) {
    next(err);
  }
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
    await user.save(); // Ensure the token and expiration are saved

    // Create reset URL using environment variableL}/api/v1/auth/reset-password/${resetToken}`;
    const resetUrl = `${process.env.SERVER_BASE_URL}/api/v1/auth/reset-password/${resetToken}`;
    const mailOptions = {
      // Send email with styled template and user's name
      to: email,
      subject: "Reset Your Password - Rurblist",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.username || user.name},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #ec6c10; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p style="margin-top: 20px; word-break: break-all;">
            If the button above doesn't work, copy and paste this link into your browser:
            <br>
            <span style="color: #ec6c10;">${resetUrl}</span>
          </p>
          <p>If you didn't request this, please ignore this email.</p>
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
    const { token } = req.params;
    const { newPassword } = req.body;

    // First find the user before doing anything
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

    // Only proceed if we have both token and password
    if (!token || !newPassword) {
      return res.render("error", {
        message: "Missing required information",
        frontendUrl: process.env.FRONTEND_URL,
      });
    }

    const { salt, hash } = genPassword(newPassword);

    // Update user info
    user.salt = salt;
    user.hash = hash;
    user.resetToken = undefined;
    user.tokenExpiration = undefined;

    await user.save();

    // Instead of JSON response, redirect to success page
    return res.redirect("/api/v1/auth/reset-success");
  } catch (error) {
    console.error("Reset password error:", error);
    return res.render("error", {
      message: "An error occurred while resetting your password",
      frontendUrl: process.env.FRONTEND_URL,
    });
  }
};

async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;

    // console.log(token);
    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    const user = await User.findOne({ refreshToken: token });

    if (!user || user.tokenExpiration < Date.now()) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function logoutUser(req, res) {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await User.updateOne(
      { refreshToken },
      { $unset: { refreshToken: "", tokenExpiration: "" } }
    );
    res.clearCookie("refreshToken");
  }
  res.json({ message: "Logged out" });
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser,
};
