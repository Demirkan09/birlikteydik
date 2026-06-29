const nodemailer = require("nodemailer");

const SMTP_HOST = "mail.birlikteydik.com";
const SMTP_PORT = 465;
const SMTP_USER = "info@birlikteydik.com";
const SMTP_PASS = "Demirkan349292";

console.log("Starting SMTP connection test on port 465...");
console.log(`Host: ${SMTP_HOST}, Port: ${SMTP_PORT}, User: ${SMTP_USER}`);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Verification FAILED on port 465:");
    console.error(error);
  } else {
    console.log("SMTP Connection on port 465 is SUCCESSFUL and ready to send messages!");
  }
  process.exit();
});
