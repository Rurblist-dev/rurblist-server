const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  email: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  phone: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  fullname: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
