const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  // service: "gmail",
  // host: "smtp.gmail.com",
  // port: 465,
  // secure: true,
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Rurblist" ${process.env.EMAIL}`,
      to,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendEmail,
};
