const express = require("express");
const { paystackWebhook } = require("../controllers/payment");
const { initializePayment } = require("../services/initializeTransaction");
const router = express.Router();

router.post("/initialize-payment", initializePayment);
router.post(
  "/paystack-webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);

module.exports = router;

// router.post(
//   "/paystack-webhook",
//   express.json({ type: "*/*" }),
//   paystackWebhook
// );
