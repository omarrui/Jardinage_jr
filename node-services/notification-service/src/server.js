const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const port = Number(process.env.PORT || 3003);

app.use(express.json());

function createTransporter() {
  // Local development should not crash just because email credentials are absent.
  // When credentials are missing, the service logs the email instead of sending it.
  if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_SERVER || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

// Internal route: other services call this to send email.
// It is not meant to be called directly by the React frontend.
app.post("/internal/email", async (req, res) => {
  const { to, subject, text } = req.body || {};

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "to, subject and text are required" });
  }

  const transporter = createTransporter();

  if (!transporter) {
    // This makes Docker/local testing easier: app flows still work without SMTP.
    console.log("Email skipped because MAIL_USERNAME or MAIL_PASSWORD is missing:", {
      to,
      subject
    });
    return res.json({ message: "Email skipped in local mode" });
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USERNAME,
    to,
    subject,
    text
  });

  return res.json({ message: "Email sent" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Notification service error" });
});

app.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});
