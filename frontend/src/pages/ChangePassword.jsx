import React, { useState } from "react";
import PropTypes from "prop-types";

function ChangePassword({ goToLogin, goHome }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Validate strength
    if (!strongPassword.test(password)) {
      setMessage(
        "Mot de passe invalide : minimum 8 caractères, 1 majuscule et 1 chiffre"
      );
      return;
    }

    // Validate confirmation
    if (!confirmPassword) {
      setMessage("Veuillez confirmer votre mot de passe");
      return;
    }

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
      console.error("Change password error:", error);
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
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "15px",
                flex: 1
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#f5f5f5",
                cursor: "pointer"
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "15px",
                flex: 1
              }}
            />
          </div>

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

ChangePassword.propTypes = {
  goToLogin: PropTypes.func.isRequired,
  goHome: PropTypes.func.isRequired
};

function RequestReset({ goToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(newPassword)) {
      setMessage(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

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
    outline: "none",
    width: "100%"
  };

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
    color: "#666"
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

RequestReset.propTypes = {
  goToLogin: PropTypes.func.isRequired
};

export { RequestReset };
export default ChangePassword;