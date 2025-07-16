const mongoose = require("mongoose");

const propertyDocumentsSchema = new mongoose.Schema(
  {
    propertyIdNumber: {
      type: String,
      unique: true,
    },
    ownershipDocument: {
      type: String,
    },
    govtApproval: {
      type: String,
    },
    utilityBill: {
      type: String,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property", // Reference to the Property schema
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const PropertyDocuments = mongoose.model(
  "PropertyDocuments",
  propertyDocumentsSchema
);
module.exports = PropertyDocuments;
