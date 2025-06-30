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
    ninSlipImg: { type: String },
    cacSlipImg: { type: String },
    userID: { type: String, unique: true, require: true }, // Unique identifier for the user, e.g., NIN or Cac number
    // National Identification Number
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    about: { type: String },
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
      // home_seeker || agent || landlord
    },
    rating: {
      type: Object,
      default: {},
    },

    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property", // Reference to Property schema
      },
    ],
    verificationStatus: {
      type: String,
      enum: [
        "unverified",
        "nin_verified",
        "cac_verified",
        "premium_verified",
        "pending",
      ],
      default: "unverified",
    },
    resetToken: {
      type: String, // This will store the password reset token
      required: false, // Not required initially
    },
    refreshToken: {
      type: String,
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
