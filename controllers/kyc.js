const Kyc = require("../schemas/Kyc");
const User = require("../schemas/User");
const { uploadPictureFile } = require("../utils/upload");
const { verifyVNIN } = require("../services/ninVerificationService");
const {
  sendKycApprovedEmail,
  sendKycRejectedEmail,
} = require("../utils/kycEmail");

exports.uploadKyc = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    const {
      firstName,
      lastName,
      ninNumber,
      cacNumber, // optional
      dob,
      address,
      city,
      nationality,
    } = req.body;
    const files = req.files;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!ninNumber || !dob || !address || !city || !nationality) {
      return res.status(400).json({
        success: false,
        error: "ninNumber, dob, address, city, nationality are required.",
      });
    }
    if (!files?.ninSlipImg?.[0]) {
      return res.status(400).json({
        success: false,
        error: "NIN slip image is required.",
      });
    }
    // CAC slip image and CAC number are optional, so no validation required
    if (!files?.selfieImg?.[0]) {
      return res.status(400).json({
        success: false,
        error: "Selfie image is required.",
      });
    }

    // Validate NIN format
    if (!/^\d{11}$/.test(ninNumber)) {
      return res.status(400).json({
        success: false,
        error: "NIN must be an 11-digit number.",
      });
    }
    // Validate date of birth format
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date of birth format. Use YYYY-MM-DD.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    const kycExists = await Kyc.findOne({ user: req.user.id });
    if (kycExists) {
      if (kycExists.status === "pending") {
        return res.status(400).json({
          success: false,
          error: "You already have a pending KYC request.",
        });
      } else {
        await Kyc.findByIdAndDelete(kycExists._id);
      }
    }

    const { secureUrl: selfieImg } = await uploadPictureFile({
      fileName: `kyc-selfie/${Date.now()}-${files.selfieImg[0].originalname}`,
      buffer: files.selfieImg[0].buffer,
      mimetype: files.selfieImg[0].mimetype,
    });
    const { secureUrl: ninSlipImg } = await uploadPictureFile({
      fileName: `kyc-selfie/${Date.now()}-${files.ninSlipImg[0].originalname}`,
      buffer: files.ninSlipImg[0].buffer,
      mimetype: files.ninSlipImg[0].mimetype,
    });

    let cacSlipImg;
    if (files?.cacSlipImg?.[0]) {
      const { secureUrl: cacSlipImgUrl } = await uploadPictureFile({
        fileName: `kyc-selfie/${Date.now()}-${
          files.cacSlipImg[0].originalname
        }`,
        buffer: files.cacSlipImg[0].buffer,
        mimetype: files.cacSlipImg[0].mimetype,
      });
      cacSlipImg = cacSlipImgUrl;
    }

    if (selfieImg) {
      userDetails.profileImg = selfieImg;
    }
    if (ninSlipImg && ninNumber) {
      userDetails.verificationStatus = "pending";
    }
    if (firstName && lastName) {
      userDetails.firstName = firstName;
      userDetails.lastName = lastName;
    }

    await userDetails.save();
    const kyc = await Kyc.create({
      dob: dobDate,
      address,
      city,
      nationality,
      ninNumber,
      ninSlipImg,
      cacNumber: cacNumber || undefined, // optional
      cacSlipImg: cacSlipImg || undefined, // optional
      selfieImg,
      user: req.user.id,
    });
    if (!kyc) {
      return res.status(500).json({
        success: false,
        error: "Failed to create KYC record.",
      });
    }

    return res.status(201).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    console.error("Error creating KYC:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.getKycByUserId = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const kyc = await Kyc.findOne({ user: req.user.id });
    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: "KYC record not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    console.error("Error fetching KYC:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.getAllKyc = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to update KYC status.",
      });
    }

    const kycs = await Kyc.find().populate("user", "firstName lastName email");
    return res.status(200).json({
      success: true,
      data: kycs,
    });
  } catch (error) {
    console.error("Error fetching all KYC records:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { status, reason } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!kycId || !status) {
      return res.status(400).json({
        success: false,
        error: "KYC ID and status are required.",
      });
    }

    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to update KYC status.",
      });
    }

    const kyc = await Kyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: "KYC record not found.",
      });
    }
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'approved', 'rejected', or 'pending'.",
      });
    }
    if (status === "approved" && kyc.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "KYC is already approved.",
      });
    }
    if (status === "rejected" && kyc.status === "rejected") {
      return res.status(400).json({
        success: false,
        error: "KYC is already rejected.",
      });
    }

    const user = await User.findById(kyc.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    kyc.status = status;
    if (reason) {
      kyc.verificationReason = reason;
    }
    if (status === "approved") {
      kyc.isKycVerified = true;
      kyc.verificationStatus = "premium_verified";
      user.isKycVerified = true;
    } else if (status === "rejected") {
      kyc.isKycVerified = false;
      kyc.verificationStatus = "unverified";
      user.isKycVerified = false;
    } else {
      kyc.isKycVerified = false;
      kyc.verificationStatus = "pending";
      user.isKycVerified = false;
    }

    await user.save();
    await kyc.save();

    if (status === "approved") {
      await sendKycApprovedEmail(user.email, user.firstName, user.lastName);
    } else if (status === "rejected") {
      await sendKycRejectedEmail(
        user.email,
        user.firstName,
        user.lastName,
        reason
      );
    }

    return res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
