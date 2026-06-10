import React, { useState, useEffect } from "react";
import "./Account.css";
import { apiUrl } from "../api/apiConfig";

function Account({ goHome }) {
  const customerId = localStorage.getItem("customer_id");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [message, setMessage] = useState("");

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [editingPassword, setEditingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // FETCH PROFILE
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetch(
        apiUrl(`/api/customer/get-profile/${customerId}`)
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [customerId]);

  // SAVE PROFILE FIELD
  async function handleSave(field) {
    const response = await fetch(
      apiUrl("/api/customer/update-profile"),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          [field]: tempValue
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setProfile({ ...profile, [field]: tempValue });
      setEditingField(null);
    }

    setMessage(data.message || data.error);
  }

  // CHANGE PASSWORD
  async function handlePasswordChange(e) {
    e.preventDefault();

    const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(passwordData.new_password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    const response = await fetch(
      apiUrl("/api/customer/change-password"),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          ...passwordData
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setEditingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    }

    setMessage(data.message || data.error);
  }

  // RENDER PROFILE FIELD
  function renderField(label, field) {
    return (
      <div className="account-row">
        <div>
          <h4>{label}</h4>

          {editingField === field ? (
            <div className="edit-section">
              <input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
              <button onClick={() => handleSave(field)}>Enregistrer</button>
              <button onClick={() => setEditingField(null)}>Annuler</button>
            </div>
          ) : (
            <p>{profile[field]}</p>
          )}
        </div>

        {editingField !== field && (
          <button
            className="edit-btn"
            onClick={() => {
              setEditingField(field);
              setTempValue(profile[field]);
            }}
          >
            Modifier
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-card">
        <h2>🌿 Informations du compte</h2>

        {renderField("Nom", "name")}
        {renderField("Email", "email")}
        {renderField("Téléphone", "phone")}

        <hr />

        <h3>🔐 Sécurité</h3>

        <div className="account-row">
          <div>
            <h4>Mot de passe</h4>

            {editingPassword ? (
              <form
                onSubmit={handlePasswordChange}
                className="password-form"
              >
                <div className="password-row">
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Mot de passe actuel"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value
                      })
                    }
                  />
                </div>

                <div className="password-row">
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value
                      })
                    }
                  />
                </div>

                <div className="password-row">
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Confirmer le mot de passe"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}
                </button>

                <div className="edit-section">
                  <button type="submit">Enregistrer</button>
                  <button
                    type="button"
                    onClick={() => setEditingPassword(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <p>********</p>
            )}
          </div>

          {!editingPassword && (
            <button
              className="edit-btn"
              onClick={() => setEditingPassword(true)}
            >
              Modifier
            </button>
          )}
        </div>

        {message && <p className="message">{message}</p>}

        <button className="back-btn" onClick={goHome}>
          Retour
        </button>
      </div>
    </div>
  );
}

export default Account;