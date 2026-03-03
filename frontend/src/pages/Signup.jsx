// Signup.jsx
// Permet à un client de créer un compte

import React, { useState } from "react";
import { signupCustomer } from "../api/api";

function Signup({ goToLogin, goHome }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
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
  
    const response = await signupCustomer(formData);
  
    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage("Compte créé avec succès. Redirection vers la connexion...");
  
      setTimeout(() => {
        goToLogin();
      }, 1500);
    }
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
        <h2 style={{ margin: 0, textAlign: "center" }}>Inscription Client</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Nom"
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <button type="submit" style={primaryBtn}>
            S'inscrire
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "14px" }}>
          Vous avez déjà un compte ?{" "}
          <button onClick={goToLogin} style={secondaryBtn}>
            Se connecter
          </button>
        </div>

        <button onClick={goHome} style={{ ...secondaryBtn, alignSelf: "center" }}>
          ← Retour à l'accueil
        </button>

        {message && (
          <p style={{ textAlign: "center", margin: 0 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;
