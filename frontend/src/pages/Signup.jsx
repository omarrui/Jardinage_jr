
import React, { useState } from "react";
import { signupCustomer } from "../api/api";

function Signup({ goToLogin, goHome }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
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
  
    const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(formData.password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
  
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

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-heading">
          <span>Nouveau client</span>
          <h2>Inscription</h2>
          <p>Créez votre accès pour gérer vos demandes plus rapidement.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <input
            type="text"
            name="name"
            placeholder="Nom"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* Password field with eye toggle */}
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

          {/* Confirm password field WITHOUT eye toggle */}
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-submit-btn">
            S'inscrire
          </button>
        </form>

        <div className="auth-inline-action">
          Vous avez déjà un compte ?{" "}
          <button onClick={goToLogin}>
            Se connecter
          </button>
        </div>

        <button onClick={goHome} className="auth-ghost-btn">
          Retour à l'accueil
        </button>

        {message && (
          <p className={message.includes("succès") ? "auth-message auth-message-success" : "auth-message auth-message-error"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;
