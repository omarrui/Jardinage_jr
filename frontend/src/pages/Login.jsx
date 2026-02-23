import React, { useState } from "react";

function Login({
  onCustomerLogin,
  onAdminLogin,
  onForcePasswordChange,
  goHome,
  goToResetRequest
}) {
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

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");

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

        // FORCE PASSWORD CHANGE
        if (data.force_password_change) {
          onForcePasswordChange(data.customer_id);
          return;
        }

        localStorage.setItem("customer_id", data.customer_id);

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        localStorage.setItem("role", "customer");

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

      {/* FORGOT PASSWORD BUTTON */}
      <p>
        Forgot your password?{" "}
        <button
          type="button"
          onClick={goToResetRequest}
        >
          Reset here
        </button>
      </p>

      <button onClick={goHome}>Go Home</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;