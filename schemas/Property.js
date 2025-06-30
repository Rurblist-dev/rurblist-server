const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PropertyImage", // Reference to PropertyImage schema
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => value > 0,
        message: "Price must be a positive number.",
      },
    },
    agentFee: {
      type: Number,
      // required: true,
      validate: {
        validator: (value) => value > 0,
        message: "Agent fee must be a positive number.",
      },
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    bathrooms: {
      type: Number,
      // required: true,
    },
    bedrooms: {
      type: Number,
      // required: true,
    },
    paymentFrequency: {
      type: String,
      enum: ["per_year", "per_week", "per_month", "one_time"],
      // default: "for_sale",
      index: true,
    },
    status: {
      type: String,
      enum: ["for_rent", "for_sale", "sold"],
      // default: "for_sale",
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: [
        "bedsitter",
        "self_contain",
        "flat",
        "boys_quarters",
        "duplexes",
        "mansion",
      ],
      index: true,
      required: true,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Changed from like to likes array
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "pending"],
      default: "unverified",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priorityLevel: {
      type: Number,
      default: 0,
    },
    priorityExpiresAt: {
      type: Date, // Optional: track how long the priority should last
    },
    priorityStartedAt: { type: Date },
  },
  { timestamps: true }
);

propertySchema.index({ location: 1, status: -1, type: 1 });

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
