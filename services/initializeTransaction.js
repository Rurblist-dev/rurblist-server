const axios = require("axios");

const User = require("../schemas/User");
const PropertyAdPackage = require("../schemas/PropertyAdPackages");

async function getUserEmailAndAdPackageAmount(
  userId,
  adPackageId // Function to fetch user email and ad package amount
) {
  // Fetch user by ID and select only the email field
  const user = await User.findById(userId).select("email");
  if (!user) throw new Error("User not found");

  // Fetch ad package by ID and select only the price field
  const adPackage = await PropertyAdPackage.findById(adPackageId).select(
    "price durationDays"
  );
  if (!adPackage) throw new Error("Ad package not found");

  return {
    email: user.email,
    amount: adPackage.price,
    priorityDurationDays: adPackage.durationDays,
  };
}

// Example usage inside your payment initialization:
// const { userId, adPackageId } = req.body;
// try {
//   const { email, amount } = await getUserEmailAndAdPackageAmount(
//     userId,
//     adPackageId
//   );
//   // Now you can use email and amount for your payment logic
// } catch (error) {
//   return res.status(400).json({ status: false, message: error.message });
// }

const initializePayment = async (req, res) => {
  const { userId, propertyId, adPackageId } = req.body;

  // const { email, amount, propertyId, priorityDurationDays } = req.body;
  try {
    const { email, amount, priorityDurationDays } =
      await getUserEmailAndAdPackageAmount(userId, adPackageId);
    // console.log(email, amount, priorityDurationDays);

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: amount * 100, // amount in kobo (Nigerian currency subunit)
        metadata: {
          propertyId: propertyId,
          priorityDurationDays: priorityDurationDays,
        },
        callback_url: "https://www.rurblist.com/thank-you", // user redirects here after payment
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      status: true,
      authorization_url: paystackResponse.data.data.authorization_url,
      access_code: paystackResponse.data.data.access_code,
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ status: false, message: "Payment initialization failed" });
  }
};

module.exports = { initializePayment };
