const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    profileImg: { type: String },
    fullname: {
      type: String,
    },

    salt: {
      type: String,
    },
    hash: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    whatsAppNumber: {
      type: Number,
    },
    phoneNumber: {
      type: Number,
    },
    role: {
      type: String,
      default: "home_seeker", // home_seeker || agent || landlord
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property", // Reference to Property schema
      },
    ],
    resetToken: {
      type: String, // This will store the password reset token
      required: false, // Not required initially
    },
    tokenExpiration: {
      type: Date, // This will store the expiration time for the reset token
      required: false, // Not required initially
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
