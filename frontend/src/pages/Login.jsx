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
      setMessage("Erreur serveur. Veuillez réessayer.");
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
    background: "#1b5e20",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s ease"
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
        <h2 style={{ margin: 0, textAlign: "center" }}>Connexion</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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

          <button type="submit" style={primaryBtn}>
            Se connecter
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "14px" }}>
          Mot de passe oublié ?{" "}
          <button type="button" onClick={goToResetRequest} style={secondaryBtn}>
            Réinitialiser ici
          </button>
        </div>

        <button onClick={goHome} style={{ ...secondaryBtn, alignSelf: "center" }}>
          ← Retour à l'accueil
        </button>

        {message && (
          <p style={{ color: "red", textAlign: "center", margin: 0 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;