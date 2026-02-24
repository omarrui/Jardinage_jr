import React, { useState } from "react";

function ChangePassword({ goToLogin, goHome }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    const customerId = localStorage.getItem("customer_id");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/customer/force-change-password",
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

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setMessage("Mot de passe mis à jour avec succès. Redirection...");

      localStorage.clear();

      setTimeout(() => {
        goToLogin();
      }, 1500);

    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  }

  return (
    <div>
      <h2>Définir un nouveau mot de passe</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Mettre à jour le mot de passe</button>
      </form>

      {message && <p>{message}</p>}

      <button onClick={goHome}>Accueil</button>
    </div>
  );
}

export default ChangePassword;