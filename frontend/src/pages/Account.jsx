import React, { useState, useEffect } from "react";
import "./Account.css";

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
    new_password: ""
  });

  // 🔥 FETCH CURRENT PROFILE
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetch(
        `http://127.0.0.1:5000/api/customer/get-profile/${customerId}`
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [customerId]);

  // 🔥 SAVE SINGLE FIELD
  async function handleSave(field) {
    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/update-profile",
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

  async function handlePasswordChange(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:5000/api/customer/change-password",
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
    setMessage(data.message || data.error);
  }

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
              <button onClick={() => handleSave(field)}>Save</button>
              <button onClick={() => setEditingField(null)}>Cancel</button>
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
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-card">
        <h2>🌿 Account Information</h2>

        {renderField("Name", "name")}
        {renderField("Email", "email")}
        {renderField("Phone", "phone")}

        <hr />

        <h3>🔐 Change Password</h3>

        <form onSubmit={handlePasswordChange} className="password-form">
          <input
            type="password"
            placeholder="Current Password"
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                current_password: e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                new_password: e.target.value
              })
            }
          />

          <button type="submit">Update Password</button>
        </form>

        {message && <p className="message">{message}</p>}

        <button className="back-btn" onClick={goHome}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Account;