const express = require("express");
const { paystackWebhook } = require("../controllers/payment");
const { initializePayment } = require("../services/initializeTransaction");
const router = express.Router();

router.post("/paystack-webhook", paystackWebhook);
router.post("/initialize-payment", initializePayment);

module.exports = router;

// router.post(
//   "/paystack-webhook",
//   express.json({ type: "*/*" }),
//   paystackWebhook
// );
