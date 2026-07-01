const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
    
  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: `CRM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent successfully!");
  console.log(info.response);
  console.log(info.messageId);
};

module.exports = { sendEmail };