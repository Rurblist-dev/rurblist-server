const mongoose = require("mongoose");

const PropertyImageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  fileName: { type: String, required: true },
  size: { type: Number, required: true },
});

module.exports = mongoose.model("PropertyImage", PropertyImageSchema);
