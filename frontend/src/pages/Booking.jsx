// Booking.jsx
import React, { useState, useEffect } from "react";

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

      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments");
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
      setMessage("Erreur serveur. Veuillez réessayer.");
    }
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
          <label>Date souhaitée</label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => setDate(e.target.value)}
            required
          />
  
          <label>Adresse d'intervention</label>
          <input
            type="text"
            placeholder="Ex: 12 rue des Oliviers, Le Muy"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
  
          <label>Description (optionnel)</label>
          <textarea
            placeholder="Ex: Taille de haie, entretien général..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
  
          <button type="submit" className="primary-btn booking-btn">
            Envoyer la demande
          </button>
        </form>
  
        {message && (
          <div
            className={`booking-message ${
              message.includes("succès") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
export default Booking;