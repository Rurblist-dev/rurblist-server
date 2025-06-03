const mongoose = require("mongoose");

const adPackageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // In Naira
  durationDays: { type: Number, required: true },
  features: [{ type: String, required: true }],
  maxProperties: { type: Number, default: 1 }, // For Quick Boost, others can be more
  mediaAssets: { type: Number, default: 0 }, // Number of media assets allowed
  isActive: { type: Boolean, default: true },
});

const PropertyAdPackage = mongoose.model("PropertyAdPackage", adPackageSchema);

module.exports = PropertyAdPackage;

// Example seed data (for reference, not part of schema):
/*
[
  {
    name: "Quick Boost",
    price: 3000,
    durationDays: 2,
    features: [
      "Show up on homepage & area search",
      "Push via WhatsApp broadcast",
      "Light boost to trending zone",
      "Max 1 property per boost"
    ],
    maxProperties: 1,
    mediaAssets: 0
  },
  {
    name: "Spotlight Boost",
    price: 7500,
    durationDays: 5,
    features: [
      "Appear in homepage “Hot Picks”",
      "WhatsApp + IG story spotlight",
      "Lead notification tracking",
      "Add 2 media assets (e.g., drone video)"
    ],
    maxProperties: 1,
    mediaAssets: 2
  },  
  {
    name: "Premium Boost",
    price: 15000,
    durationDays: 7,
    features: [
      "Listed as “Rurblist Featured Property”",
      "Pinned in 3 top zones",
      "IG reel + WhatsApp video promotion",
      "SMS alert to active seekers",
      "Lead capture & agent follow-up alert"
    ],
    maxProperties: 1,
    mediaAssets: 0
  },
  {
    name: "Full Market Takeover",
    price: 20000,
    durationDays: 7,
    features: [
      "Homepage + Top city banner placement",
      "Shared in 3 real estate groups (optional)",
      "Custom video ad on Rurblist socials",
      "Dedicated lead handler alert system",
      "Real-time performance report",
      "Access to leads after campaign ends"
    ],
    maxProperties: 1,
    mediaAssets: 0
  }
]
*/
