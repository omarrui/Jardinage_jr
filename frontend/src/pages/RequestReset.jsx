import React, { useState } from "react";

function RequestReset({ goToLogin }) {
  const [step, setStep] = useState(1); // 1 = send code, 2 = verify code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSendCode(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Reset code sent to your email.");
    setStep(2); // move to step 2
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
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
    }, 1500);
  }

  return (
    <div>
      <h2>Reset Password</h2>

      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Code</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            value={email}
            disabled
          />

          <input
            type="text"
            placeholder="Enter reset code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit">Reset Password</button>
        </form>
      )}

      {message && <p>{message}</p>}

      <button onClick={goToLogin}>Back to Login</button>
    </div>
  );
}

export default RequestReset;