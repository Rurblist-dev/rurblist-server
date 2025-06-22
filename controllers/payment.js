const crypto = require("crypto");
const Property = require("../schemas/Property");
// const Property = require("./models/property"); // your property model

// exports.paystackWebhook = (req, res) => {
//   console.log("Received Paystack webhook event:", req.body);

//   const hash = crypto
//     .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
//     .update(req.body) // req.body is a Buffer from express.raw
//     .digest("hex");

//   const signature = req.headers["x-paystack-signature"];

//   if (hash !== signature) {
//     return res.status(400).send("Invalid signature");
//   }

//   // ✅ Valid request
//   const event = JSON.parse(req.body);
//   console.log("💰 Paystack webhook received:", event.event);

//   res.sendStatus(200);
// };

const paystackWebhook = async (req, res) => {
  // console.log("Received Paystack webhook event");
  // const verifyPaystackSignature = (req) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body) // req.body is a Buffer from express.raw
    .digest("hex");

  const signature = req.headers["x-paystack-signature"];
  // };

  if (hash !== signature) {
    return res.status(400).send("Invalid signature");
  }

  // if (!verifyPaystackSignature(req)) {
  //   console.log("Invalid signature received from Paystack");

  //   return res.status(400).send("Invalid signature");
  // }

  const event = JSON.parse(req.body);

  if (event.event === "charge.success") {
    const { metadata } = event.data;
    const { propertyId, priorityDurationDays } = metadata;

    // console.log(propertyId);

    // Update property priority level & expiration date
    const priorityBoostValue = priorityDurationDays; // Example: how much priority boosts per purchase

    try {
      // Fetch the property to get the current priorityExpiresAt
      const property = await Property.findById(propertyId);

      let newPriorityExpiresAt;
      const now = Date.now();
      const durationMs = priorityDurationDays * 24 * 60 * 60 * 1000;

      if (
        property &&
        property.priorityExpiresAt &&
        property.priorityExpiresAt > now
      ) {
        // If not expired, add to the existing expiration
        newPriorityExpiresAt = new Date(
          property.priorityExpiresAt.getTime() + durationMs
        );
      } else {
        // If expired or not set, start from now
        newPriorityExpiresAt = new Date(now + durationMs);
      }

      await Property.findByIdAndUpdate(propertyId, {
        $inc: { priorityLevel: priorityBoostValue },
        priorityExpiresAt: newPriorityExpiresAt,
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
