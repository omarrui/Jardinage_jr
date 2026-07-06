const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = Number(process.env.PORT || 5000);

// The gateway knows where each internal service lives.
// React never calls these URLs directly; only the gateway does.
const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3001";
const appointmentServiceUrl =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:3002";

// CORS protects the API from random browser origins.
// In local dev we allow the Vite frontend URLs.
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

// Health routes are small diagnostics used to check whether a service is alive.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

// Every proxy uses the same base behavior:
// forward the incoming request to another service and preserve the path.
const proxyOptions = (target) => ({
  target,
  changeOrigin: true
});

// Identity/customer routes belong to the auth service.
// The gateway keeps the public API stable while hiding the internal split.
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

// Booking, service-request, calendar, and availability routes belong to
// the appointment service.
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

// If no proxy matched the path, the gateway returns the error itself.
app.use((req, res) => {
  res.status(404).json({ error: "Route not found in API gateway" });
});

app.listen(port, () => {
  console.log(`API gateway listening on port ${port}`);
});
