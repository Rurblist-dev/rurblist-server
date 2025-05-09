const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  email: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  phone: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
    validate: {
      validator: function (v) {
        // Allow international format with + or without, digits and dashes
        return /^(\+\d{1,3})?[-\s]?\d{3,}[-\s]?\d{3,}[-\s]?\d{3,}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Format: +123-456-789-000 or similar`,
    },
  },
  fullname: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  tourType: {
    type: String,
    required: true, // Ensure this field is mandatory; adjust as needed
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true, // Ensure this field is mandatory; adjust as needed
  },

  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  homeSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
