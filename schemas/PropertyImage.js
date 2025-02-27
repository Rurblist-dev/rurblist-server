const mongoose = require("mongoose");

const PropertyImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  size: { type: Number, required: true },
  cloudinaryId: { type: String, required: true }, // Add Cloudinary ID
});

module.exports = mongoose.model("PropertyImage", PropertyImageSchema);
