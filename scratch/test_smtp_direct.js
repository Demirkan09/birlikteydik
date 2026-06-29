const nodemailer = require("nodemailer");

const SMTP_HOST = "157.90.173.248"; // Direct VDS IP
const SMTP_PORT = 587;
const SMTP_USER = "info@birlikteydik.com";
const SMTP_PASS = "Demirkan349292";

console.log("Starting direct SMTP connection test on port 587...");
console.log(`Host: ${SMTP_HOST}, Port: ${SMTP_PORT}, User: ${SMTP_USER}`);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
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
    console.error("Direct SMTP Verification FAILED:");
    console.error(error);
  } else {
    console.log("Direct SMTP Connection is SUCCESSFUL!");
  }
  process.exit();
});
