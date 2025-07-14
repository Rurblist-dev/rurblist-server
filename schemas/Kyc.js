const mongoose = require("mongoose");

const KycSchema = new mongoose.Schema(
  {
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    nationality: { type: String, required: true },
    ninNumber: { type: String, unique: true },
    ninSlipImg: { type: String },
    cacNumber: { type: String },
    cacSlipImg: { type: String },
    selfieImg: { type: String },
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationReason: { type: String, default: "" },
    isKycVerified: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kyc", KycSchema);
