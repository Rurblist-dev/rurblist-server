const { sendEmail } = require("./email");

/**
 * Send “KYC Approved” notification
 * --------------------------------
 * @param {string}   email      Recipient’s address
 * @param {string}   firstName  Recipient’s first name
 * @param {string}   lastName   Recipient’s last name
 * @returns {Promise<void>}
 */
const sendKycApprovedEmail = async (email, firstName, lastName) => {
  const rurblistEmail = process.env.EMAIL;
  const currentYear = new Date().getFullYear();

  const subject = "✅ Your KYC Verification Has Been Approved!";

  const text = `
Hello ${firstName} ${lastName},

Great news – your KYC verification has been approved!

You now have full access to Rurblist’s premium features:
• List, buy, or invest in properties with higher limits.
• View exclusive listings and market insights.
• Enjoy faster transactions and priority support.

Log in here: ${process.env.FRONTEND_URL}/dashboard

If you have any questions, reply to this email or call 1‑800‑RURBLIST.

Best regards,
The Rurblist Support Team
  `.trim();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KYC Approved – Rurblist</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="padding:20px;text-align:center;background:#ec6c10;color:#fff;">
        <h1 style="margin:0;">Rurblist</h1>
        <p style="margin:0;">Your Access To Dream Home!</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:20px;">
        <p>Dear <strong>${firstName}</strong>,</p>
        <p style="font-size:16px;line-height:1.5;">
          <strong>Congratulations!</strong> Your Know‑Your‑Customer (KYC) verification has been 
          <span style="color:#27ae60;">approved</span>. Your account is now fully verified.
        </p>

        <h3 style="margin-top:25px;">What’s next?</h3>
        <ul style="padding-left:20px;margin:10px 0;">
          <li>List or invest in properties with higher transaction limits.</li>
          <li>Access premium listings and exclusive market data.</li>
          <li>Enjoy faster payouts and priority support.</li>
        </ul>

        <p style="text-align:center;margin:25px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#ec6c10;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
            Go to Dashboard
          </a>
        </p>

        <p>If you have any questions, our support team is here to help:</p>
        <p style="font-size:14px;">
          <strong>Email:</strong> <a href="mailto:${rurblistEmail}" style="color:#ec6c10;">${rurblistEmail}</a><br/>
          <strong>Phone:</strong> 1‑800‑RURBLIST
        </p>

        <p>Thank you for choosing Rurblist. Happy house‑hunting!</p>
        <p>Best regards,<br/>The Rurblist Team</p>

        <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;"/>

        <p style="text-align:center;font-size:14px;color:#555;">
          P.S. Follow us on social media for the latest listings and tips!
        </p>

        <p style="text-align:center;">
          <a href="[Insert Facebook Link]"  style="color:#ec6c10;text-decoration:none;">Facebook</a>&nbsp;|&nbsp;
          <a href="[Insert Twitter Link]"   style="color:#ec6c10;text-decoration:none;">Twitter</a>&nbsp;|&nbsp;
          <a href="[Insert Instagram Link]" style="color:#ec6c10;text-decoration:none;">Instagram</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:10px;text-align:center;background:#f1f1f1;color:#777;font-size:12px;">
        &copy; ${currentYear} Rurblist. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(email, subject, text, html);
};

/**
 * Send “KYC Rejected” notification
 * ---------------------------------
 * @param {string}  email      Recipient’s address
 * @param {string}  firstName  Recipient’s first name
 * @param {string}  lastName   Recipient’s last name
 * @param {string}  [reason]   Optional rejection reason
 * @returns {Promise<void>}
 */
const sendKycRejectedEmail = async (
  email,
  firstName,
  lastName,
  reason = ""
) => {
  const rurblistEmail = process.env.EMAIL;
  const currentYear = new Date().getFullYear();

  const subject = "⚠️ Action Required – Your KYC Submission Was Rejected";

  /* ---------------------------- Plain‑text part --------------------------- */
  const text = `
Hello ${firstName} ${lastName},

Unfortunately, we couldn't approve your KYC submission.

${reason ? `Reason provided:\n« ${reason} »\n` : ""}

What to do next:
• Review the rejection reason (if any) and gather correct documents.
• Log in to your dashboard and resubmit your KYC.
• Contact our support team if you need assistance.

Dashboard: ${process.env.FRONTEND_URL}/kyc

If you have questions, reply to this email or call 1‑800‑RURBLIST.

Best regards,
The Rurblist Support Team
  `.trim();

  /* ----------------------------- HTML part ------------------------------- */
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KYC Rejected – Rurblist</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="padding:20px;text-align:center;background:#ec6c10;color:#fff;">
        <h1 style="margin:0;">Rurblist</h1>
        <p style="margin:0;">Your Access To Dream Home!</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:20px;">
        <p>Dear <strong>${firstName}</strong>,</p>

        <p style="font-size:16px;line-height:1.5;color:#c0392b;">
          We’re sorry, but we couldn’t approve your Know‑Your‑Customer (KYC) submission.
        </p>

        ${
          reason
            ? `<p style="background:#fdecea;border-left:4px solid #c0392b;padding:12px 16px;margin:20px 0;">
              <strong>Reason provided:</strong><br/>${reason}
            </p>`
            : ""
        }

        <h3 style="margin-top:25px;">What happens now?</h3>
        <ul style="padding-left:20px;margin:10px 0;">
          <li>Review the rejection reason (if any) and gather correct documents.</li>
          <li>Log in and resubmit your KYC when you’re ready.</li>
          <li>Contact our support team for guidance if you’re unsure.</li>
        </ul>

        <p style="text-align:center;margin:25px 0;">
          <a href="${
            process.env.FRONTEND_URL
          }/kyc" style="background:#ec6c10;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
            Resubmit KYC
          </a>
        </p>

        <p>If you need help, we’re here for you:</p>
        <p style="font-size:14px;">
          <strong>Email:</strong> <a href="mailto:${rurblistEmail}" style="color:#ec6c10;">${rurblistEmail}</a><br/>
          <strong>Phone:</strong> 1‑800‑RURBLIST
        </p>

        <p>Thank you for your patience and for choosing Rurblist.</p>
        <p>Best regards,<br/>The Rurblist Team</p>

        <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;"/>

        <p style="text-align:center;font-size:14px;color:#555;">
          Follow us on social media for property tips and updates!
        </p>
        <p style="text-align:center;">
          <a href="[Insert Facebook Link]"  style="color:#ec6c10;text-decoration:none;">Facebook</a>&nbsp;|&nbsp;
          <a href="[Insert Twitter Link]"   style="color:#ec6c10;text-decoration:none;">Twitter</a>&nbsp;|&nbsp;
          <a href="[Insert Instagram Link]" style="color:#ec6c10;text-decoration:none;">Instagram</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:10px;text-align:center;background:#f1f1f1;color:#777;font-size:12px;">
        &copy; ${currentYear} Rurblist. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(email, subject, text, html);
};

module.exports = { sendKycApprovedEmail, sendKycRejectedEmail };
