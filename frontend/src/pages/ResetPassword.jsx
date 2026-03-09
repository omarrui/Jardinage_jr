import React, { useState, useEffect } from "react";
import "./ResetPassword.css";

function ResetPassword({ goToLogin }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");
    setToken(tokenFromURL);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(newPassword)) {
      setMessage("Le mot de passe doit contenir 8 caractères, 1 majuscule et 1 chiffre");
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/customer/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erreur");
        setIsError(true);
        return;
      }

      setMessage("Mot de passe mis à jour. Redirection...");
      setIsError(false);

      setTimeout(() => {
        goToLogin();
      }, 2000);
    } catch (error) {
      setMessage("Erreur de connexion");
      setIsError(true);
    }
  }

  const passwordContainerStyle = {
    position: "relative",
    width: "100%"
  };

  const eyeButtonStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#666",
    padding: "0",
    display: "flex",
    alignItems: "center"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 40px 12px 12px" 
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Définir un nouveau mot de passe</h2>

        <form onSubmit={handleSubmit}>
          {/* New password field with eye toggle */}
          <div style={passwordContainerStyle}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButtonStyle}
              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Confirm password field WITHOUT eye toggle */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Mettre à jour le mot de passe</button>
        </form>

        {message && (
          <p className={`reset-message ${isError ? 'error' : ''}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
