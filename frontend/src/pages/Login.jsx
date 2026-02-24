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

  return (
    <div>
      <h2>Connexion</h2>

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
          placeholder="Mot de passe"
          onChange={handleChange}
        />

        <button type="submit">Se connecter</button>
      </form>

      <p>
        Mot de passe oublié ?{" "}
        <button
          type="button"
          onClick={goToResetRequest}
        >
          Réinitialiser ici
        </button>
      </p>

      <button onClick={goHome}>Accueil</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;