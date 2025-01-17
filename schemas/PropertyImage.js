const mongoose = require("mongoose");

const propertyImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const propertyImage = mongoose.model("PropertyImage", propertyImageSchema);
module.exports = propertyImage;