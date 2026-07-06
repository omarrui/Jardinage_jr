const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const express = require("express");
const { generateToken, requireAdmin } = require("../../shared/auth");
const { initDatabase, query } = require("../../shared/db");
const { postJson } = require("../../shared/http");

const app = express();
const port = Number(process.env.PORT || 3001);

// The auth service does not send SMTP email directly.
// It asks the notification service to send emails through this internal URL.
const notificationUrl = process.env.NOTIFICATION_SERVICE_URL
  ? `${process.env.NOTIFICATION_SERVICE_URL}/internal/email`
  : "";

app.use(express.json());

// Public API responses should not expose database-only details like password hashes.
function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    has_account: Boolean(customer.has_account),
    must_change_password: Boolean(customer.must_change_password)
  };
}

// These small repository-style helpers keep SQL lookup code out of route bodies.
async function getCustomerByEmail(email) {
  const rows = await query("SELECT * FROM customers WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function getCustomerById(id) {
  const rows = await query("SELECT * FROM customers WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

// Used when the admin creates an account and the customer must change password.
function randomPassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
}

// Quick uptime check for Docker or manual debugging.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

// Customer signup:
// validate input -> hash password -> create customer or activate public-request customer.
app.post("/api/signup", async (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const existing = await getCustomerByEmail(email);

  // Never store raw passwords. bcrypt stores a one-way hash instead.
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    // Public quote requests can create customers without accounts.
    // If that email later signs up, we upgrade that record into a real account.
    if (!existing.password) {
      await query(
        "UPDATE customers SET name = ?, phone = ?, password = ?, has_account = TRUE, must_change_password = FALSE WHERE id = ?",
        [name, phone, passwordHash, existing.id]
      );
      return res.status(201).json({ message: "Customer registered successfully" });
    }

    return res.status(400).json({ error: "Email already registered" });
  }

  await query(
    "INSERT INTO customers (name, email, password, phone, has_account, must_change_password) VALUES (?, ?, ?, ?, TRUE, FALSE)",
    [name, email, passwordHash, phone]
  );

  return res.status(201).json({ message: "Customer registered successfully" });
});

// Customer login:
// find user -> compare password hash -> return JWT token or force password change.
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required" });
  }

  const customer = await getCustomerByEmail(email);

  if (!customer || !customer.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, customer.password);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (customer.must_change_password) {
    // Admin-created accounts start here because they receive a temporary password.
    return res.json({
      message: "You must change your password",
      force_password_change: true,
      customer_id: customer.id
    });
  }

  return res.json({
    message: "Login successful",
    // The token lets React call protected routes without sending the password again.
    token: generateToken({ customer_id: customer.id, role: "customer" }),
    role: "customer",
    customer_id: customer.id,
    force_password_change: false
  });
});

// Admin login is environment-variable based in this branch.
// This avoids needing an admins table seed during local Docker setup.
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body || {};

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.json({
      message: "Admin login successful",
      token: generateToken({ customer_id: 0, role: "admin" }),
      role: "admin"
    });
  }

  return res.status(401).json({ error: "Invalid admin credentials" });
});

// Password reset step 1:
// generate a short-lived code and ask notification-service to email it.
app.post("/api/customer/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const customer = await getCustomerByEmail(email);

  if (!customer) {
    return res.status(404).json({ error: "Email not found" });
  }

  const code = String(crypto.randomInt(100000, 999999));
  // Reset codes expire quickly so an old email cannot be reused later.
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await query("UPDATE customers SET reset_code = ?, reset_code_expiry = ? WHERE id = ?", [
    code,
    expiry,
    customer.id
  ]);

  await postJson(notificationUrl, {
    to: email,
    subject: "Réinitialisation du mot de passe - JR Jardinage",
    text: `Bonjour ${customer.name},\n\nVoici votre code de réinitialisation :\n\n${code}\n\nCe code expire dans 10 minutes.\n\nJR Jardinage`
  });

  return res.json({ message: "Reset code sent to your email." });
});

// Password reset step 2:
// verify code + expiry, then replace the password hash.
app.post("/api/customer/reset-password", async (req, res) => {
  const { email, code, new_password } = req.body || {};

  if (!email || !code || !new_password) {
    return res.status(400).json({ error: "Missing data" });
  }

  const customer = await getCustomerByEmail(email);

  if (!customer || customer.reset_code !== code) {
    return res.status(400).json({ error: "Invalid code" });
  }

  if (!customer.reset_code_expiry || new Date(customer.reset_code_expiry) < new Date()) {
    return res.status(400).json({ error: "Code expired" });
  }

  const passwordHash = await bcrypt.hash(new_password, 12);
  await query(
    "UPDATE customers SET password = ?, reset_code = NULL, reset_code_expiry = NULL, must_change_password = FALSE WHERE id = ?",
    [passwordHash, customer.id]
  );

  return res.json({ message: "Password updated successfully" });
});

// First login for admin-created customers.
// They know the temporary password, then must choose their own real password.
app.post("/api/customer/force-change-password", async (req, res) => {
  const { customer_id, new_password } = req.body || {};

  if (!customer_id || !new_password) {
    return res.status(400).json({ error: "Missing data" });
  }

  const customer = await getCustomerById(customer_id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const passwordHash = await bcrypt.hash(new_password, 12);
  await query("UPDATE customers SET password = ?, must_change_password = FALSE WHERE id = ?", [
    passwordHash,
    customer_id
  ]);

  return res.json({ message: "Password updated successfully" });
});

// Logged-in password change flow from the account page.
app.put("/api/customer/change-password", async (req, res) => {
  const { customer_id, current_password, new_password } = req.body || {};

  if (!customer_id || !current_password || !new_password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const customer = await getCustomerById(customer_id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const passwordMatches = await bcrypt.compare(current_password, customer.password || "");

  if (!passwordMatches) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(new_password, 12);
  await query("UPDATE customers SET password = ? WHERE id = ?", [passwordHash, customer_id]);

  return res.json({ message: "Password updated successfully" });
});

// Legacy-compatible password-change endpoint kept because the frontend had
// more than one password-change route during the migration.
app.post("/api/change-password", async (req, res) => {
  const { email, old_password, new_password } = req.body || {};

  if (!email || !old_password || !new_password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const customer = await getCustomerByEmail(email);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const passwordMatches = await bcrypt.compare(old_password, customer.password || "");

  if (!passwordMatches) {
    return res.status(401).json({ error: "Incorrect old password" });
  }

  await query("UPDATE customers SET password = ?, must_change_password = FALSE WHERE id = ?", [
    await bcrypt.hash(new_password, 12),
    customer.id
  ]);

  return res.json({ message: "Password changed successfully" });
});

// Customer profile update.
app.put("/api/customer/update-profile", async (req, res) => {
  const { customer_id, name, email, phone } = req.body || {};

  if (!customer_id) {
    return res.status(400).json({ error: "Missing customer ID" });
  }

  const customer = await getCustomerById(customer_id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  if (email && email !== customer.email) {
    // Emails must stay unique because login uses email as the identity.
    const existing = await getCustomerByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }
  }

  await query(
    "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?",
    [name || customer.name, email || customer.email, phone || customer.phone, customer_id]
  );

  return res.json({ message: "Profile updated successfully" });
});

// Customer profile read.
app.get("/api/customer/get-profile/:customerId", async (req, res) => {
  const customer = await getCustomerById(req.params.customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  return res.json({
    name: customer.name,
    email: customer.email,
    phone: customer.phone
  });
});

// Everything below this point is admin-only customer management.
// requireAdmin checks the JWT before the handler runs.
app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  const rows = await query("SELECT id, name, email, phone, has_account, must_change_password FROM customers ORDER BY id DESC");
  return res.json(rows.map(publicCustomer));
});

app.post("/api/admin/customers", requireAdmin, async (req, res) => {
  const { name, email, phone, has_account = false } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ Error: "NAME and PHONE are required" });
  }

  if (!has_account) {
    // Internal customer: admin wants the client in the database,
    // but the client cannot log in yet.
    const result = await query(
      "INSERT INTO customers (name, email, phone, has_account, must_change_password) VALUES (?, ?, ?, FALSE, TRUE)",
      [name, email || null, phone]
    );
    const customer = await getCustomerById(result.insertId);
    return res.status(201).json({ message: "Internal customer created", customer: publicCustomer(customer) });
  }

  if (!email) {
    return res.status(400).json({ error: "Email required for login account" });
  }

  if (await getCustomerByEmail(email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const tempPassword = randomPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const result = await query(
    "INSERT INTO customers (name, email, password, phone, has_account, must_change_password) VALUES (?, ?, ?, ?, TRUE, TRUE)",
    [name, email, passwordHash, phone]
  );
  const customer = await getCustomerById(result.insertId);

  await postJson(notificationUrl, {
    // Service-to-service call: auth-service asks notification-service to email.
    to: email,
    subject: "Votre compte JR Jardinage",
    text: `Bonjour ${name},\n\nVotre compte JR Jardinage a été créé.\n\nMot de passe temporaire : ${tempPassword}\n\nVeuillez le modifier lors de votre première connexion.\n\nJR Jardinage`
  });

  return res.status(201).json({
    message: "Customer account created and email sent",
    customer: publicCustomer(customer)
  });
});

app.put("/api/admin/customers/:customerId", requireAdmin, async (req, res) => {
  const customer = await getCustomerById(req.params.customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const { email, phone } = req.body || {};

  if (email && email !== customer.email && await getCustomerByEmail(email)) {
    return res.status(400).json({ error: "Email already in use" });
  }

  await query("UPDATE customers SET email = ?, phone = ? WHERE id = ?", [
    email || customer.email,
    phone || customer.phone,
    customer.id
  ]);

  return res.json({ message: "Customer updated successfully" });
});

app.delete("/api/admin/customers/:customerId", requireAdmin, async (req, res) => {
  const customer = await getCustomerById(req.params.customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  if (!customer.must_change_password) {
    // Activated customers are protected from accidental admin deletion.
    return res.status(400).json({ error: "Cannot delete activated customer" });
  }

  await query("DELETE FROM customers WHERE id = ?", [customer.id]);
  return res.json({ message: "Customer deleted successfully" });
});

app.post("/api/admin/resend-temp-password/:customerId", requireAdmin, async (req, res) => {
  const customer = await getCustomerById(req.params.customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  if (!customer.email) {
    return res.status(400).json({ error: "Customer has no email" });
  }

  const tempPassword = randomPassword();
  await query("UPDATE customers SET password = ?, must_change_password = TRUE WHERE id = ?", [
    await bcrypt.hash(tempPassword, 12),
    customer.id
  ]);

  await postJson(notificationUrl, {
    to: customer.email,
    subject: "Nouveau mot de passe temporaire - JR Jardinage",
    text: `Bonjour ${customer.name},\n\nVotre mot de passe temporaire a été réinitialisé.\n\nMot de passe temporaire : ${tempPassword}\n\nJR Jardinage`
  });

  return res.json({ message: "Temporary password resent successfully" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Auth service error" });
});

// Start order:
// 1. ensure database tables exist
// 2. start listening for HTTP requests
initDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Auth service listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start auth service:", error);
    process.exit(1);
  });
