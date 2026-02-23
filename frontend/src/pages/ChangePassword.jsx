import React, { useState } from "react";

function ChangePassword({ goHome }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const customerId = localStorage.getItem("customer_id");

    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/change-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          new_password: password,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setMessage("Password updated successfully. Please log in again.");
    localStorage.clear();
  }

  return (
    <div>
      <h2>Set New Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
      </form>

      {message && <p>{message}</p>}

      <button onClick={goHome}>Go Home</button>
    </div>
  );
}

export default ChangePassword;
