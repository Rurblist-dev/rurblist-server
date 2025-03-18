const mongoose = require("mongoose");
require("dotenv").config();

const dbConnection = async () => {
  try {
    // Try to connect with the provided URL
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log("Database connection successful! 😇");
  } catch (error) {
    console.log("MongoDB Connection Error:", error.message);

    // Check if using Atlas and it failed
    if (process.env.MONGO_URL.includes("mongodb+srv")) {
      console.log(
        "Unable to connect to MongoDB Atlas. Please check your network connection and MongoDB Atlas settings."
      );
      console.log(
        "Tips: Ensure your IP is whitelisted in MongoDB Atlas or try using a local MongoDB instance."
      );
    } else if (process.env.MONGO_URL.includes("localhost")) {
      console.log(
        "Unable to connect to local MongoDB. Please make sure MongoDB is installed and running on your machine."
      );
      console.log(
        "Run 'mongod' in a separate terminal to start MongoDB locally."
      );
    }
  }
};

mongoose.connection.on("disconnected", () =>
  console.log("Database disconnected! 😢")
);
mongoose.connection.on("connected", () =>
  console.log("Database Connected! 😇")
);

module.exports.connection = dbConnection;
