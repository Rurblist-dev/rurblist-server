const cron = require("node-cron");
const Property = require("../schemas/Property");
// const Property = require("../models/Property"); // adjust the path

// Run once every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily priority decay task...");

  const now = new Date();

  try {
    // Get properties with active priority
    const properties = await Property.find({
      priorityLevel: { $gt: 0 },
      priorityStartedAt: { $exists: true },
      priorityExpiresAt: { $exists: true, $gt: now },
    });

    for (const property of properties) {
      const { priorityStartedAt, priorityExpiresAt, priorityLevel } = property;

      const totalDurationMs = priorityExpiresAt - priorityStartedAt;
      const elapsedMs = now - priorityStartedAt;

      if (totalDurationMs <= 0 || elapsedMs < 0) continue; // skip invalid entries

      const percentElapsed = elapsedMs / totalDurationMs;

      // New priority: reduce based on time passed
      const newPriority = Math.floor(priorityLevel * (1 - percentElapsed));

      // Avoid negative or redundant writes
      if (newPriority < property.priorityLevel) {
        property.priorityLevel = newPriority;
        await property.save();
        console.log(
          `Updated priority for property ${property._id} to ${newPriority}`
        );
      }
    }

    // Handle expired priority
    const expired = await Property.updateMany(
      {
        priorityExpiresAt: { $lt: now },
        priorityLevel: { $gt: 0 },
      },
      {
        $set: { priorityLevel: 0 },
        $unset: { priorityStartedAt: "", priorityExpiresAt: "" },
      }
    );

    if (expired.modifiedCount > 0) {
      console.log(
        `Reset ${expired.modifiedCount} expired property priorities to 0`
      );
    }

    console.log("Daily priority decay task completed.");
  } catch (error) {
    console.error("Error during priority decay task:", error);
  }
});

// const cron = require("node-cron");
// const Property = require("../models/Property"); // adjust path
// const sendEmail = require("../utils/sendEmail");
// const User = require("../models/User"); // Assuming you want to email property owner

// // Run once daily at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("Running daily priority decay and notification task...");

//   const now = new Date();
//   const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

//   try {
//     const properties = await Property.find({
//       priorityLevel: { $gt: 0 },
//       priorityStartedAt: { $exists: true },
//       priorityExpiresAt: { $exists: true, $gt: now },
//     }).populate("user", "email fullname");

//     for (const property of properties) {
//       const { priorityStartedAt, priorityExpiresAt, priorityLevel, user } =
//         property;

//       const totalDurationMs = priorityExpiresAt - priorityStartedAt;
//       const elapsedMs = now - priorityStartedAt;

//       if (totalDurationMs <= 0 || elapsedMs < 0) continue;

//       const percentElapsed = elapsedMs / totalDurationMs;
//       const newPriority = Math.floor(priorityLevel * (1 - percentElapsed));

//       if (newPriority < property.priorityLevel) {
//         property.priorityLevel = newPriority;
//         await property.save();
//         console.log(
//           `Updated priority for property ${property._id} to ${newPriority}`
//         );
//       }

//       // Send notification if priorityExpiresAt is within 1 day (priority about to expire)
//       if (
//         priorityExpiresAt <= oneDayLater &&
//         priorityExpiresAt > now &&
//         user?.email
//       ) {
//         const emailContent = `
//           <p>Hi ${user.fullname},</p>
//           <p>Your property titled "<strong>${
//             property.title
//           }</strong>" has a priority boost that will expire on <strong>${priorityExpiresAt.toDateString()}</strong>.</p>
//           <p>Consider renewing your priority to keep your property prioritized in search results.</p>
//           <p>Thank you!</p>
//         `;

//         await sendEmail(
//           user.email,
//           "Your Property Priority is About to Expire",
//           emailContent
//         );
//       }
//     }

//     // Handle expired priority and notify owners
//     const expiredProperties = await Property.find({
//       priorityExpiresAt: { $lt: now },
//       priorityLevel: { $gt: 0 },
//     }).populate("user", "email fullname");

//     for (const expiredProperty of expiredProperties) {
//       if (expiredProperty.user?.email) {
//         const emailContent = `
//           <p>Hi ${expiredProperty.user.fullname},</p>
//           <p>Your property titled "<strong>${
//             expiredProperty.title
//           }</strong>" priority boost has expired as of <strong>${expiredProperty.priorityExpiresAt.toDateString()}</strong>.</p>
//           <p>You can renew your priority to regain visibility in the search results.</p>
//           <p>Thank you!</p>
//         `;

//         await sendEmail(
//           expiredProperty.user.email,
//           "Your Property Priority Has Expired",
//           emailContent
//         );
//       }
//     }

//     // Reset expired priorities
//     const expiredReset = await Property.updateMany(
//       {
//         priorityExpiresAt: { $lt: now },
//         priorityLevel: { $gt: 0 },
//       },
//       {
//         $set: { priorityLevel: 0 },
//         $unset: { priorityStartedAt: "", priorityExpiresAt: "" },
//       }
//     );

//     if (expiredReset.modifiedCount > 0) {
//       console.log(
//         `Reset ${expiredReset.modifiedCount} expired property priorities.`
//       );
//     }

//     console.log("Daily priority decay and notification task completed.");
//   } catch (error) {
//     console.error("Error in priority decay and notification task:", error);
//   }
// });
