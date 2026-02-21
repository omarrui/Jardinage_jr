// Single login page for both Customer and Admin

import React, { useState } from "react";

function Login({ onCustomerLogin, onAdminLogin, goHome }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      let response;
      let data;

      // ADMIN LOGIN
      if (formData.email === "admin@gardening.com") {

        response = await fetch("http://127.0.0.1:5000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        data = await response.json();

        if (data.error) {
          setMessage(data.error);
          return;
        }

        // This will be used later to protect admin routes
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");

        setMessage("Admin login successful");
        onAdminLogin();

      } else {

        // CUSTOMER LOGIN
        response = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        data = await response.json();

        if (data.error) {
          setMessage(data.error);
          return;
        }

        // Store customer_id (needed for bookings)
        localStorage.setItem("customer_id", data.customer_id);

        // This makes system scalable and production-ready
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        localStorage.setItem("role", "customer");

        setMessage("Login successful");

        // REMOVED data.name (backend does not send it)
        onCustomerLogin();
      }

    } catch (error) {
      setMessage("Server error. Try again.");
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">Log In</button>
      </form>

      <p>
        Changed your mind?{" "}
        <button onClick={goHome}>Go Home</button>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;