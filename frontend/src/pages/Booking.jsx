// Booking.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function Booking({ goHome }) {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [message, setMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchAppointments = async () => {
    const customerId = localStorage.getItem("customer_id");
  
    if (!customerId || customerId === "undefined") {
      console.log("Invalid customer ID:", customerId);
      return;
    }
  
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/customer/service-requests?customer_id=${customerId}`
      );
  
      const data = await res.json();
  
      setAppointments(data.requests || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleSubmit(e) {
    e.preventDefault();

    const customerId = localStorage.getItem("customer_id");

    if (!customerId || customerId === "undefined") {
      setMessage("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    if (!date) {
      setMessage("Veuillez sélectionner une date.");
      return;
    }

    if (!address) {
      setMessage("Veuillez entrer l'adresse d'intervention.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/service-requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: customerId,
            preferred_date: date,
            address: address,
            description: description || ""
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
        return;
      }

      setMessage("Demande envoyée avec succès !");
      setDate("");
      setDescription("");
      setAddress("");

      await fetchAppointments();

    } catch (error) {
      console.error("Submit error:", error);
      setMessage("Erreur serveur. Veuillez réessayer.");
    }
  }

  function getStatusStyle(status) {
    if (status === "scheduled") {
      return { bg: "#e8f5e9", color: "#2e7d32" };
    }
    if (status === "pending") {
      return { bg: "#fff8e1", color: "#f57c00" };
    }
    return { bg: "#fdecea", color: "#c62828" };
  }

  return (
    <div className="booking-wrapper">
      <div className="booking-card">
        <h2 className="section-title">
          🌿 Demande de service de jardinage
        </h2>
  
        <p className="booking-subtitle">
          Sélectionnez une date et décrivez votre besoin.
        </p>
  
        <form onSubmit={handleSubmit} className="booking-form">
          <label htmlFor="preferredDate">Date souhaitée</label>
          <input
            id="preferredDate"
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => setDate(e.target.value)}
            required
          />
  
          <label htmlFor="address">Adresse d'intervention</label>
          <input
            id="address"
            type="text"
            placeholder="Ex: 12 rue des Oliviers, Le Muy"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
  
          <label htmlFor="description">Description (optionnel)</label>
          <textarea
            id="description"
            placeholder="Ex: Taille de haie, entretien général..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
  
          <button type="submit" className="primary-btn booking-btn">
            Envoyer la demande
          </button>
        </form>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            fetchAppointments();
            setShowAppointments(!showAppointments);
          }}
          style={{ marginTop: "15px" }}
        >
          📋 Mes rendez-vous
        </button>
  
        {message && (
          <div
            className={`booking-message ${
              message.includes("succès") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {showAppointments && (
          <div className="appointments-section" style={{ marginTop: "30px", textAlign: "left" }}>
            <h3 style={{ marginBottom: "15px", color: "#1b5e20" }}>
              📅 Mes rendez-vous
            </h3>

            {appointments.filter((appt) => appt.status !== "cancelled").length === 0 ? (
              <p>Aucun rendez-vous pour le moment.</p>
            ) : (
              appointments
                .filter((appt) => appt.status !== "cancelled")
                .map((appt) => {
                const statusStyle = getStatusStyle(appt.status);
                return (
                <div
                  key={appt.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "18px",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    color: "#1b1b1b"
                  }}
                >
                  <p><strong>Date demandée :</strong> {appt.preferred_date}</p>
                  <p><strong>Adresse :</strong> {appt.address}</p>
                  <p>
                    <strong>Status :</strong>{" "}
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color
                      }}
                    >
                      {appt.status}
                    </span>
                  </p>

                  {appt.scheduled_start && (
                    <p>
                      <strong>Rendez-vous prévu :</strong>{" "}
                      {new Date(appt.scheduled_start).toLocaleString()}
                    </p>
                  )}
                </div>
              )})
            )}
          </div>
        )}
      </div>
    </div>
  );
}
Booking.propTypes = {
  goHome: PropTypes.func.isRequired
};
export default Booking;