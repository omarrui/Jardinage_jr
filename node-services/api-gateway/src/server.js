const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = Number(process.env.PORT || 5000);

const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3001";
const appointmentServiceUrl =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:3002";

const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

const proxyOptions = (target) => ({
  target,
  changeOrigin: true
});

app.use([
  "/api/signup",
  "/api/login",
  "/api/change-password",
  "/api/customer/forgot-password",
  "/api/customer/reset-password",
  "/api/customer/force-change-password",
  "/api/customer/change-password",
  "/api/customer/update-profile",
  "/api/customer/get-profile",
  "/api/admin/login",
  "/api/admin/customers",
  "/api/admin/resend-temp-password"
], createProxyMiddleware(proxyOptions(authServiceUrl)));

app.use([
  "/api/service-requests",
  "/api/public/service-requests",
  "/api/appointments",
  "/api/customer/service-requests",
  "/api/customer/appointments",
  "/api/customer/cancel-appointment",
  "/api/admin/service-requests",
  "/api/admin/create-appointment",
  "/api/admin/appointments",
  "/api/admin/appointment-requests",
  "/api/admin/availability"
], createProxyMiddleware(proxyOptions(appointmentServiceUrl)));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found in API gateway" });
});

app.listen(port, () => {
  console.log(`API gateway listening on port ${port}`);
});
