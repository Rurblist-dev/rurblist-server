const express = require("express");
const path = require("path");
const dbConnection = require("./config/database").connection;
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const propertiesRoute = require("./routes/property");
const tourRoute = require("./routes/tour");
const commentRoute = require("./routes/comment");

require("dotenv").config();

const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 8000;

// Configure view engine - make sure this is before routes
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// Add the following middleware to enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/properties", propertiesRoute);
app.use("/api/v1/tour", tourRoute);
app.use("/api/v1/comments", commentRoute);

// Welcome route should be before the catch-all route
app.get("/", (req, res) => {
  res.render("welcome");
});

// 404 handler for routes not found
app.use("*", (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).render("error", {
    message: "Route not found",
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  // First try to render error template
  try {
    res.status(errorStatus).render("error", {
      message: errorMessage,
    });
  } catch (renderError) {
    // If rendering fails, fall back to JSON response
    console.error("Error rendering error template:", renderError);
    res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

app.listen(PORT, () => {
  dbConnection();
  console.log(`Server running at port ${PORT}`);
});
