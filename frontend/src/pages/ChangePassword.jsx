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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "50px 40px",
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1b5e20",
            marginBottom: "10px",
            fontSize: "24px"
          }}
        >
          Définir un nouveau mot de passe
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px"
            }}
          />

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px"
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#1b5e20",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Mettre à jour le mot de passe
          </button>
        </form>

        {message && (
          <p style={{ textAlign: "center", color: "#444" }}>{message}</p>
        )}

        <button
          onClick={goHome}
          style={{
            marginTop: "10px",
            background: "transparent",
            border: "none",
            color: "#1b5e20",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Accueil
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;