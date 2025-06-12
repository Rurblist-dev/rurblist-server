const crypto = require("crypto");
const Property = require("../schemas/Property");
// const Property = require("./models/property"); // your property model

const paystackWebhook = async (req, res) => {
  console.log("Received Paystack webhook event");
  const verifyPaystackSignature = (req) => {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    return hash === req.headers["x-paystack-signature"];
  };

  if (!verifyPaystackSignature(req)) {
    console.log("Invalid signature received from Paystack");

    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body);
  console.log("Event received:", event);

  if (event.event === "charge.success") {
    const { metadata } = event.data;
    const { propertyId, priorityDurationDays } = metadata;

    console.log(propertyId);

    // Update property priority level & expiration date
    const priorityBoostValue = 10; // Example: how much priority boosts per purchase

    try {
      await Property.findByIdAndUpdate(propertyId, {
        $inc: { priorityLevel: priorityBoostValue },
        priorityExpiresAt: new Date(
          Date.now() + priorityDurationDays * 24 * 60 * 60 * 1000
        ),
        isActive: true,
      });

      return res.status(200).send("Payment processed and priority updated");
    } catch (err) {
      console.error("Error updating property priority:", err);
      return res.status(500).send("Failed to update property");
    }
  }

  res.status(200).send("Event ignored");
};

module.exports = { paystackWebhook };
