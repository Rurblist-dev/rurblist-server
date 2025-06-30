const mongoose = require("mongoose");

const PropertyVerificationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    propertyType: { type: String, required: true }, // e.g., "apartment", "house"
    ownershipDocumentNumber: { type: String, required: true },
    ownershipDocumentImg: { type: String, required: true }, // URL to uploaded document
    propertyPhotoImg: { type: String, required: true }, // URL to property photo
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["approved", "rejected", "under_review"],
      default: "under_review",
    },
    verificationReason: { type: String },
    isPropertyVerified: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PropertyVerification",
  PropertyVerificationSchema
);
