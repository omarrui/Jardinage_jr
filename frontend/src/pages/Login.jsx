import React, { useState } from "react";
import PropTypes from "prop-types";
import { apiUrl } from "../api/apiConfig";

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
  const [showPassword, setShowPassword] = useState(false);

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

        response = await fetch(apiUrl("/api/admin/login"), {
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

        response = await fetch(apiUrl("/api/login"), {
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
      console.error("Login error:", error);
      setMessage("Erreur serveur. Veuillez réessayer.");
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    
    try {
      const response = await fetch(apiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the admin token
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");
        
        onAdminLogin();
      } else {
        setMessage(data.error || "Invalid admin credentials");
      }
    } catch (err) {
      setMessage("Connection error");
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-heading">
          <span>Espace client</span>
          <h2>Connexion</h2>
          <p>Accédez à vos demandes et rendez-vous JR Jardinage.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* Password field with toggle */}
          <div className="auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? "Cacher" : "Voir"}
            </button>
          </div>

          <button type="submit" className="auth-submit-btn">
            Se connecter
          </button>
        </form>

        <div className="auth-inline-action">
          Mot de passe oublié ?{" "}
          <button type="button" onClick={goToResetRequest}>
            Réinitialiser ici
          </button>
        </div>

        <button onClick={goHome} className="auth-ghost-btn">
          Retour à l'accueil
        </button>

        {message && (
          <p className="auth-message auth-message-error">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

Login.propTypes = {
  onCustomerLogin: PropTypes.func.isRequired,
  onAdminLogin: PropTypes.func.isRequired,
  onForcePasswordChange: PropTypes.func.isRequired,
  goHome: PropTypes.func.isRequired,
  goToResetRequest: PropTypes.func.isRequired
};

export default Login;
