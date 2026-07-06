const express = require("express");
const { requireAdmin, requireCustomer, verifyToken, getBearerToken } = require("../../shared/auth");
const { initDatabase, query } = require("../../shared/db");
const { postJson } = require("../../shared/http");

const app = express();
const port = Number(process.env.PORT || 3002);

// Appointment service owns scheduling, but email delivery is delegated.
const notificationUrl = process.env.NOTIFICATION_SERVICE_URL
  ? `${process.env.NOTIFICATION_SERVICE_URL}/internal/email`
  : "";

app.use(express.json());

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

// MySQL DATETIME does not store the trailing Z timezone marker.
// This helper converts JavaScript Date values into MySQL-friendly strings.
function mysqlDateTime(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}

// Shapes database rows into the JSON format expected by the React frontend.
function serviceRequestRow(row) {
  return {
    id: row.id,
    customer_id: row.customer_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    preferred_date: row.preferred_date,
    description: row.description,
    address: row.address,
    status: row.status,
    created_at: iso(row.created_at),
    scheduled_start: iso(row.scheduled_start),
    scheduled_end: iso(row.scheduled_end)
  };
}

// Small SQL helpers keep route handlers focused on business flow.
async function getCustomerById(customerId) {
  const rows = await query("SELECT * FROM customers WHERE id = ? LIMIT 1", [customerId]);
  return rows[0] || null;
}

async function getCustomerByEmail(email) {
  const rows = await query("SELECT * FROM customers WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function getRequestById(requestId) {
  const rows = await query("SELECT * FROM service_requests WHERE id = ? LIMIT 1", [requestId]);
  return rows[0] || null;
}

// Admin calendar needs appointment data plus customer contact information.
async function allRequestsWithCustomers() {
  const rows = await query(`
    SELECT
      sr.*,
      c.name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone
    FROM service_requests sr
    LEFT JOIN customers c ON c.id = sr.customer_id
    ORDER BY sr.created_at DESC
  `);

  return rows.map(serviceRequestRow);
}

// Appointment service does not send SMTP itself.
// It asks notification-service to email the customer when needed.
async function notifyCustomer(customerId, subject, text) {
  const customer = await getCustomerById(customerId);

  if (!customer || !customer.email) return;

  await postJson(notificationUrl, {
    to: customer.email,
    subject,
    text
  });
}

// Quick uptime check.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "appointment-service" });
});

// Logged-in customer creates a service request.
// Two paths are supported because the Flask app had both during development.
app.post(["/api/service-requests", "/api/appointments"], async (req, res) => {
  const {
    customer_id,
    preferred_date,
    date,
    time,
    description = "Service request",
    address = "TBD"
  } = req.body || {};

  const requestedDate = preferred_date || date;

  if (!customer_id || !requestedDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const customer = await getCustomerById(customer_id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const result = await query(
    "INSERT INTO service_requests (customer_id, preferred_date, description, address, status) VALUES (?, ?, ?, ?, 'pending')",
    [customer_id, time ? `${requestedDate} ${time}` : requestedDate, description || "Service request", address]
  );

  return res.status(201).json({
    message: "Appointment created",
    id: result.insertId
  });
});

// Public quote request: visitor does not need a login account.
// We create a non-active customer record so the admin can manage the request.
app.post("/api/public/service-requests", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim() || null;
  const phone = String(req.body?.phone || "").trim();
  const address = String(req.body?.address || "").trim();
  const preferredDate = String(req.body?.preferred_date || req.body?.date || "").trim();
  const description = String(req.body?.description || "").trim();

  if (!name || !phone || !address || !preferredDate) {
    return res.status(400).json({ error: "Name, phone, address and preferred date are required" });
  }

  let customer = email ? await getCustomerByEmail(email) : null;

  if (customer && (customer.has_account || customer.password)) {
    // If the email already belongs to an account, the user should log in instead.
    return res.status(400).json({
      error: "Un compte existe déjà avec cet email. Connectez-vous pour demander un devis."
    });
  }

  if (!customer) {
    // New public visitor becomes a non-active customer.
    const result = await query(
      "INSERT INTO customers (name, email, phone, has_account, must_change_password) VALUES (?, ?, ?, FALSE, TRUE)",
      [name, email, phone]
    );
    customer = await getCustomerById(result.insertId);
  } else {
    await query(
      "UPDATE customers SET name = ?, phone = ?, has_account = FALSE, password = NULL, must_change_password = TRUE WHERE id = ?",
      [customer.name || name, customer.phone || phone, customer.id]
    );
  }

  const requestResult = await query(
    "INSERT INTO service_requests (customer_id, preferred_date, description, address, status) VALUES (?, ?, ?, ?, 'pending')",
    [customer.id, preferredDate, description || "Demande sans compte", address]
  );

  await postJson(notificationUrl, {
    // Admin notification for the public quote form.
    to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL,
    subject: "Nouvelle demande sans compte - JR Jardinage",
    text: `Nouvelle demande reçue depuis le formulaire public.\n\nNom : ${name}\nEmail : ${email || "Non renseigné"}\nTéléphone : ${phone}\nAdresse : ${address}\nDate souhaitée : ${preferredDate}\n\nDescription :\n${description || "Non renseignée"}`
  });

  return res.status(201).json({
    message: "Request sent successfully",
    customer_id: customer.id,
    request_id: requestResult.insertId
  });
});

// Customer request list used by the booking/client appointments UI.
app.get("/api/customer/service-requests", async (req, res) => {
  const customerId = req.query.customer_id;

  if (!customerId) {
    return res.status(400).json({ error: "customer_id required" });
  }

  const rows = await query(
    "SELECT * FROM service_requests WHERE customer_id = ? ORDER BY created_at DESC",
    [customerId]
  );

  return res.json({ requests: rows.map(serviceRequestRow) });
});

// Compatibility route from the Flask version.
app.get("/api/service-requests/:customerId", async (req, res) => {
  const rows = await query(
    "SELECT * FROM service_requests WHERE customer_id = ? ORDER BY created_at DESC",
    [req.params.customerId]
  );

  return res.json({ requests: rows.map(serviceRequestRow) });
});

// Protected customer appointment list.
// A customer can only read their own appointments.
app.get("/api/customer/appointments/:customerId", requireCustomer, async (req, res) => {
  if (Number(req.auth.customer_id) !== Number(req.params.customerId)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const rows = await query(
    "SELECT * FROM service_requests WHERE customer_id = ? ORDER BY created_at DESC",
    [req.params.customerId]
  );

  return res.json({ requests: rows.map(serviceRequestRow) });
});

// Protected customer cancellation route.
// We mark as cancelled instead of deleting so history remains visible.
app.delete("/api/customer/appointments/:requestId", requireCustomer, async (req, res) => {
  const request = await getRequestById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (Number(request.customer_id) !== Number(req.auth.customer_id)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  await query("UPDATE service_requests SET status = 'cancelled' WHERE id = ?", [request.id]);
  return res.json({ message: "Appointment cancelled successfully" });
});

// Older cancellation path kept for frontend compatibility.
app.delete("/api/customer/cancel-appointment/:requestId", async (req, res) => {
  const request = await getRequestById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ error: "Rendez-vous introuvable" });
  }

  await query("UPDATE service_requests SET status = 'cancelled' WHERE id = ?", [request.id]);
  return res.json({ message: "Rendez-vous annulé avec succès" });
});

// Admin can list all service requests with customer details.
app.get("/api/admin/service-requests", requireAdmin, async (req, res) => {
  return res.json(await allRequestsWithCustomers());
});

// Admin calendar endpoint.
app.get("/api/admin/appointment-requests", requireAdmin, async (req, res) => {
  const requests = await allRequestsWithCustomers();

  if (req.query.format === "array") {
    return res.json(requests);
  }

  return res.json({ requests });
});

// Small badge/count endpoint for pending requests.
app.get("/api/admin/appointment-requests/count", requireAdmin, async (req, res) => {
  const rows = await query("SELECT COUNT(*) AS count FROM service_requests WHERE status = 'pending'");
  return res.json({ count: rows[0].count });
});

// Shared scheduler used by both admin create-appointment endpoints.
// It can either schedule an existing request_id or create a new scheduled request.
async function saveAppointment(data, res) {
  const {
    request_id,
    customer_id,
    scheduled_start,
    scheduled_end,
    address = "",
    description = "Scheduled by admin"
  } = data || {};

  if (!scheduled_start) {
    return res.status(400).json({ error: "Start time required" });
  }

  const startDate = new Date(scheduled_start);
  const endDate = scheduled_end ? new Date(scheduled_end) : null;

  // Validate dates before saving so the calendar does not receive broken events.
  if (Number.isNaN(startDate.getTime()) || (scheduled_end && Number.isNaN(endDate.getTime()))) {
    return res.status(400).json({ error: "Invalid datetime format. Use ISO format (YYYY-MM-DDTHH:MM:SS)" });
  }

  if (startDate < new Date()) {
    return res.status(400).json({ error: "Start time cannot be in the past" });
  }

  if (endDate && endDate < startDate) {
    return res.status(400).json({ error: "End time cannot be before start time" });
  }

  if (request_id) {
    // Case 1: admin confirms a customer request.
    const request = await getRequestById(request_id);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    await query(
      "UPDATE service_requests SET status = 'scheduled', scheduled_start = ?, scheduled_end = ?, address = ? WHERE id = ?",
      [mysqlDateTime(startDate), mysqlDateTime(endDate), address || request.address, request.id]
    );

    await notifyCustomer(
      request.customer_id,
      "Rendez-vous confirmé - JR Jardinage",
      `Bonjour,\n\nVotre rendez-vous a été confirmé.\n\nDate : ${startDate.toLocaleString("fr-FR")}\nAdresse : ${address || request.address}\n\nJR Jardinage`
    );

    return res.json({ message: "Appointment scheduled successfully" });
  }

  if (customer_id) {
    // Case 2: admin creates an appointment directly from the calendar.
    const result = await query(
      "INSERT INTO service_requests (customer_id, preferred_date, description, address, status, scheduled_start, scheduled_end) VALUES (?, ?, ?, ?, 'scheduled', ?, ?)",
      [customer_id, startDate.toISOString().slice(0, 10), description, address, mysqlDateTime(startDate), mysqlDateTime(endDate)]
    );

    await notifyCustomer(
      customer_id,
      "Rendez-vous confirmé - JR Jardinage",
      `Bonjour,\n\nVotre rendez-vous a été confirmé.\n\nDate : ${startDate.toLocaleString("fr-FR")}\nAdresse : ${address}\n\nJR Jardinage`
    );

    return res.status(201).json({ message: "Appointment created successfully", id: result.insertId });
  }

  return res.status(400).json({ error: "Missing request_id or customer_id" });
}

// Admin creates or confirms an appointment.
app.post(["/api/admin/create-appointment", "/api/admin/appointments"], requireAdmin, async (req, res) => {
  return saveAppointment(req.body, res);
});

// Admin updates appointment status, date/time, or address.
app.put(["/api/admin/service-requests/:requestId", "/api/admin/appointments/:requestId"], requireAdmin, async (req, res) => {
  const request = await getRequestById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ error: "Service request not found" });
  }

  const scheduledStart = req.body?.scheduled_start ? new Date(req.body.scheduled_start) : null;
  const scheduledEnd = req.body?.scheduled_end ? new Date(req.body.scheduled_end) : null;

  if (scheduledStart && scheduledStart < new Date()) {
    return res.status(400).json({ error: "Cannot schedule in the past" });
  }

  if (scheduledStart && scheduledEnd && scheduledStart >= scheduledEnd) {
    return res.status(400).json({ error: "Start time must be before end time" });
  }

  const nextStatus = req.body?.status || request.status;
  const nextAddress = req.body?.address || request.address;

  await query(
    "UPDATE service_requests SET status = ?, scheduled_start = ?, scheduled_end = ?, address = ? WHERE id = ?",
    [
      nextStatus,
      scheduledStart ? mysqlDateTime(scheduledStart) : request.scheduled_start,
      scheduledEnd ? mysqlDateTime(scheduledEnd) : request.scheduled_end,
      nextAddress,
      request.id
    ]
  );

  await notifyCustomer(
    request.customer_id,
    nextStatus === "cancelled" ? "Rendez-vous annulé - JR Jardinage" : "Rendez-vous modifié - JR Jardinage",
    nextStatus === "cancelled"
      ? "Bonjour,\n\nVotre rendez-vous a été annulé.\n\nJR Jardinage"
      : `Bonjour,\n\nVotre rendez-vous a été modifié.\n\nNouvelle date : ${scheduledStart || request.scheduled_start}\nAdresse : ${nextAddress}\n\nJR Jardinage`
  );

  return res.json({ message: "Appointment updated successfully" });
});

// Admin cancels a pending request.
app.put("/api/admin/appointment-requests/:requestId/cancel", requireAdmin, async (req, res) => {
  const request = await getRequestById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  await query("UPDATE service_requests SET status = 'cancelled' WHERE id = ?", [request.id]);
  return res.json({ message: "Request cancelled successfully" });
});

// Admin cancels a scheduled appointment.
app.delete("/api/admin/appointments/:appointmentId", requireAdmin, async (req, res) => {
  const request = await getRequestById(req.params.appointmentId);

  if (!request) {
    return res.status(404).json({ error: "Rendez-vous introuvable" });
  }

  await query("UPDATE service_requests SET status = 'cancelled' WHERE id = ?", [request.id]);
  return res.json({ message: "Rendez-vous annulé" });
});

// Blocked dates are stored separately from appointments.
app.post("/api/admin/availability", requireAdmin, async (req, res) => {
  const { date } = req.body || {};

  if (!date) {
    return res.status(400).json({ error: "Date required" });
  }

  await query("INSERT IGNORE INTO availability (date) VALUES (?)", [date]);
  return res.status(201).json({ message: "Date bloquée" });
});

// Calendar loads this list and disables/marks blocked days.
app.get("/api/admin/availability", requireAdmin, async (req, res) => {
  const rows = await query("SELECT date FROM availability ORDER BY date ASC");
  return res.json(rows);
});

// Admin unblocks a date.
app.delete("/api/admin/availability/:date", requireAdmin, async (req, res) => {
  const result = await query("DELETE FROM availability WHERE date = ?", [req.params.date]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Date non trouvée" });
  }

  return res.json({ message: "Date débloquée" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Appointment service error" });
});

// Start only after the database schema is ready.
initDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Appointment service listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start appointment service:", error);
    process.exit(1);
  });
