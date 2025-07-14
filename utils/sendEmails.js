// const ZeptoMail = require("@netcore/zeptomail-node");

// const zeptoClient = new ZeptoMail({
//   apiKey: process.env.ZEPTOMAIL_API_KEY, // Store your API key securely
// });

// async function sendEmail(to, subject, htmlContent) {
//   try {
//     const response = await zeptoClient.sendEmail({
//       from: "yourverifiedemail@yourdomain.com", // Must be verified in ZeptoMail
//       to,
//       subject,
//       html: htmlContent,
//     });

//     console.log(`Email sent to ${to}: Message ID ${response.messageId}`);
//   } catch (error) {
//     console.error("Failed to send email via ZeptoMail:", error);
//   }
// }

// module.exports = sendEmail;
