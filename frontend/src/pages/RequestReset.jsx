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

  return (
    <div>
      <h2>Réinitialisation du mot de passe</h2>

      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Envoyer le code</button>
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
            placeholder="Entrez le code de réinitialisation"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit">Réinitialiser le mot de passe</button>
        </form>
      )}

      {message && <p>{message}</p>}

      <button onClick={goToLogin}>Retour à la connexion</button>
    </div>
  );
}

export default RequestReset;