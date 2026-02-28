import React, { useState } from "react";

function RequestReset({ goToLogin }) {
  const [step, setStep] = useState(1);
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

    setMessage("Code de réinitialisation envoyé à votre email.");
    setStep(2);
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

    setMessage("Mot de passe mis à jour avec succès. Redirection...");

    setTimeout(() => {
      goToLogin();
    }, 1500);
  }

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
    padding: "20px"
  };

  const cardStyle = {
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none"
  };

  const primaryBtn = {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#e67e22",
    color: "white",
    fontWeight: "600",
    cursor: "pointer"
  };

  const secondaryBtn = {
    background: "none",
    border: "none",
    color: "#1b5e20",
    fontWeight: "600",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0, textAlign: "center" }}>
          Réinitialisation du mot de passe
        </h2>

        {step === 1 && (
          <form
            onSubmit={handleSendCode}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" style={primaryBtn}>
              Envoyer le code
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleResetPassword}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              value={email}
              disabled
              style={{ ...inputStyle, background: "#f5f5f5" }}
            />

            <input
              type="text"
              placeholder="Entrez le code de réinitialisation"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <button type="submit" style={primaryBtn}>
              Réinitialiser le mot de passe
            </button>
          </form>
        )}

        {message && (
          <p style={{ textAlign: "center", margin: 0 }}>
            {message}
          </p>
        )}

        <button
          onClick={goToLogin}
          style={{ ...secondaryBtn, alignSelf: "center" }}
        >
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );
}

export default RequestReset;