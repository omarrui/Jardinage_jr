import React, { useState, useEffect } from "react";

function ResetPassword({ goToLogin }) {
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");
    setToken(tokenFromURL);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          new_password: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Password updated successfully. Redirecting...");

    setTimeout(() => {
      goToLogin();
    }, 2000);
  }

  return (
    <div>
      <h2>Set New Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;