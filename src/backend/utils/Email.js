const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});

const sendEmail = async ({ to, subject, html }) => {

  console.log("Starting sendMail...");
  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: `CRM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  //   console.log("Email sent successfully!");
  //   console.log(info.response);
  //   console.log(info.messageId);
};

module.exports = { sendEmail };