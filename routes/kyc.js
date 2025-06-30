const express = require("express");
const router = express.Router();
const {
  uploadKyc,
  getKycByUserId,
  getAllKyc,
  updateKycStatus,
} = require("../controllers/kyc");
const { verifyToken } = require("../lib/verifyToken");
const multerUpload = require("../config/multer");

router.use(verifyToken);

router.post(
  "/upload-kyc",
  multerUpload.fields([
    { name: "ninSlipImg", maxCount: 1 },
    { name: "cacSlipImg", maxCount: 1 },
    { name: "selfieImg", maxCount: 1 },
  ]),
  uploadKyc
);
router.get("/", getKycByUserId);
router.get("/all", getAllKyc);
router.post("/update-status/:kycId", updateKycStatus);

module.exports = router;
