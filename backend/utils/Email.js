const dns = require("dns");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (err) {
  // Ignored on environments that don't support it
}

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (err) {
  console.warn("[Email Service] nodemailer is not installed. Outgoing emails will be logged only.");
}

let transporter = null;
if (nodemailer && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.warn("SMTP Verify Warning:", error.message);
      } else {
        console.log("SMTP Server is ready");
      }
    });
  } catch (err) {
    console.warn("Could not create nodemailer transporter:", err.message);
  }
}

const sendEmail = async ({ to, subject, html }) => {
  console.log("Starting sendMail...");
  console.log("Sending email to:", to);

  if (!transporter) {
    console.log(`[Email Simulation] To: ${to}, Subject: "${subject}"`);
    return {
      success: true,
      simulated: true,
      message: "Email logged to console (nodemailer or credentials not configured)",
    };
  }

  const info = await transporter.sendMail({
    from: `CRM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
};

module.exports = { sendEmail };